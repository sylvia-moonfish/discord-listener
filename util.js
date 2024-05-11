import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Export __dirname so that it can be used in ES6 module.
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Iterate through available js files under given directory,
// and run the work function with the file content as first param
// and path as second param.
export const forEachJsFile = async (dir, work) => {
  const jsFileNames = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".js"));

  for (const jsFileName of jsFileNames) {
    const jsFilePath = path.join(dir, jsFileName);
    const jsFile = (await import(`file://${jsFilePath}`)).default;

    work(jsFile, jsFilePath);
  }
};
