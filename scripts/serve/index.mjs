import { createReadStream, existsSync, unlinkSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import * as os from "node:os";
import { join } from "node:path";

import { watch } from "chokidar";
import Mime from "mime";
import pc from "picocolors";
import { WebSocketServer } from "ws";

import { logDebug, logServer, logWss } from "../common/live/print.mjs";

const cachePath = "node_modules/.serve/";
const port = 8731;

/** @param {string} path */
async function exists(path) {
    return existsSync(path) && (await stat(path)).isFile();
}

const favicon = join("scripts/serve", "plink.ico");

const server = http.createServer();
server.on("request", async (req, res) => {
    const url = new URL(`http://localhost${req.url}`);

    if (url.pathname === "/favicon.ico") {
        const ico = await readFile(favicon);
        return res
            .writeHead(200, {
                "content-type": "image/x-icon",
                "content-length": ico.length,
            })
            .end(ico);
    }

    let path = join("dist", url.pathname);
    let file = (await exists(path)) && (await stat(path));

    if (
        (!file || !file.isFile()) &&
        (await exists(join("dist", url.pathname, "index.html")))
    ) {
        path = join("dist", url.pathname, "index.html");
        file = await stat(path);
    }

    if (file) {
        res.writeHead(200, {
            "content-type": Mime.getType(file),
            "content-length": file.size,
        });

        const sr = createReadStream(path);
        sr.on("data", chunk => res.write(chunk));
        sr.on("close", () => res.end());
    } else {
        res.writeHead(404);
        res.end("Not Found");
    }

    const text = `${res.statusCode >= 400 && res.statusCode <= 599 ? `${res.statusCode} (${res.statusMessage}) "${req.method} ${url.pathname}"` : `${res.statusCode} "${req.method} ${url.pathname}"`}`;

    logServer(
        `${pc.bold(
            res.statusCode < 500
                ? res.statusCode < 400
                    ? res.statusCode < 300
                        ? res.statusCode < 200
                            ? // 1XX
                              pc.cyan(text)
                            : // 2XX
                              pc.green(text)
                        : // 3XX
                          pc.magenta(text)
                    : // 4XX
                      pc.yellow(text)
                : // 5XX
                  pc.red(text),
        )}   ${pc.gray(req.headers["user-agent"] ?? "-")}`,
    );
});

const wss = new WebSocketServer({
    server,
});

/** @type {Map<string, Set<string>>} */
const wssCatchup = new Map();
/** @type {Set<string>} */
const allCatchup = new Set();

wss.on("connection", ws => {
    let heartbeat, identity;

    ws.addEventListener("message", event => {
        /** @type {import("./types").WSS.IncomingMessage} */
        let data;
        try {
            data = JSON.parse(event.data.toString());
        } catch {
            return;
        }

        if (
            data.op === "connect" &&
            typeof data.identity === "string" &&
            !identity
        ) {
            identity = data.identity;

            const catchup = wssCatchup.get(data.identity) ?? allCatchup;
            ws.send(
                JSON.stringify({
                    op: "connect",
                    catchup: [...catchup.values()],
                }),
            );

            heartbeat = setInterval(
                () => ws.send(JSON.stringify({ op: "ping" })),
                20e3,
            );
        }
    });

    ws.addEventListener("close", () => {
        if (identity) wssCatchup.set(identity, new Set());
        clearInterval(heartbeat);
    });
});

function updateListener() {
    setTimeout(async () => {
        const text = await readFile(join(cachePath, "update"), "utf8");
        const plugins = text.split("\u0000");

        if (plugins[0]) {
            logWss(
                `Rejuvenating ${pc.bold(plugins.length)} plugin${plugins.length !== 1 ? "s" : ""} for ${pc.bold(wss.clients.size)} client${wss.clients.size !== 1 ? "s" : ""}`,
            );

            for (const plugin of plugins) {
                allCatchup.add(plugin);
                wssCatchup.forEach(set => set.add(plugin));
            }
            wss.clients.forEach(ws =>
                ws.send(JSON.stringify({ op: "update", update: plugins })),
            );
        }
    }, 50);
}

server.listen(port, async () => {
    const interfaces = Object.entries(os.networkInterfaces())
        .map(([group, entries]) =>
            entries.map(entry => ({
                ...entry,
                group,
            })),
        )
        .flat()
        .filter(int => int.family === "IPv4");
    const longestInterface = Math.max(
        ...interfaces.map(int => int.address.length),
    );

    logDebug("Server and WSS started on:");
    for (const int of interfaces)
        logDebug(
            `  - http://${int.address}${pc.white(`:${port}`)}${" ".repeat(longestInterface - int.address.length)}  ${pc.bold(int.group)}`,
        );

    await mkdir(cachePath, { recursive: true });
    await writeFile(join(cachePath, "update"), "");

    watch(join(cachePath, "update"), { ignoreInitial: true }).on(
        "change",
        updateListener,
    );
});

process.stdin.resume();

function exitHandler(options) {
    if (options.cleanup) unlinkSync(join(cachePath, "update"));
    if (options.exit) process.exit();
}

process.on("exit", exitHandler.bind(null, { cleanup: true }));

process.on("SIGINT", exitHandler.bind(null, { exit: true }));

process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
