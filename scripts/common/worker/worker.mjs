import { pathToFileURL } from "node:url";
import { workerData } from "node:worker_threads";

import { tsImport } from "tsx/esm/api";

const filename = workerData?.__ts_worker_filename;
if (filename) await tsImport(pathToFileURL(filename), import.meta.url);
