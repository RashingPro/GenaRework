import path from "node:path";
import fs from "node:fs";

export interface FilePreparingResult {
    wasCreated: boolean;
}

export function prepareFile(file: string, options?: { clear: boolean }) {
    const dir = path.dirname(file);
    fs.mkdirSync(dir, { recursive: true });

    let wasCreated = false;

    try {
        fs.statSync(file);
    } catch {
        wasCreated = true;
    }

    fs.appendFileSync(file, ""); // create a file if not exists

    const stat = fs.statSync(file);
    if (!stat.isFile()) throw new Error();

    if (!!options?.clear) fs.truncateSync(file, 0); // clear file
    return { wasCreated: wasCreated };
}
