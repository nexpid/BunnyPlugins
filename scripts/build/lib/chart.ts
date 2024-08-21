import { randomUUID } from "node:crypto";

/**
 * @param {object} data
 * @param {Record<string, any>} vars
 */
export function stringifyChart(data, vars) {
    /** @type {Map<string, (...args: any[]) => void>} */
    const replace = new Map();

    /** @param {object} */
    const browse = obj => {
        for (const key of Object.keys(obj)) {
            if (typeof obj[key] === "function") {
                const uuid = randomUUID();
                replace.set(uuid, obj[key]);
                obj[key] = uuid;
            } else if (Array.isArray(obj[key])) {
                let i = -1;
                for (const entry of obj[key]) {
                    i++;

                    if (typeof entry === "function") {
                        const uuid = randomUUID();
                        replace.set(uuid, obj[key][i]);
                        obj[key][i] = uuid;
                    } else if (
                        typeof entry === "object" &&
                        !Array.isArray(entry)
                    )
                        browse(entry);
                }
            } else if (typeof obj[key] === "object") browse(obj[key]);
        }
    };

    browse(data);
    const res = JSON.stringify(data);

    return encodeURIComponent(
        [...replace.entries()].reduce(
            (string, [uuid, func]) =>
                string.replaceAll(
                    `"${uuid}"`,
                    Object.entries(vars).reduce(
                        (string, [variab, res]) =>
                            string.replaceAll(variab, JSON.stringify(res)),
                        func.toString(),
                    ),
                ),
            res,
        ),
    );
}
