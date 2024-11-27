import fs from "fs";
import { parseReceipt } from "./parse_receipt.js";

async function main(filePath) {
  const jsonFile = fs.readFileSync(filePath);
  const entities = JSON.parse(jsonFile);

  const items = parseReceipt(entities);
  console.log(JSON.stringify(items, null, 2));
}

main(...process.argv.slice(2)).catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
