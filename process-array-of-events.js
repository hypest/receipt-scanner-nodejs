import fs from "fs";
import { processCloudEvent } from "./processCloudEvent.js";

// run like this: node process-array-of-events.js events.json
async function main(filePath) {
  const eventsFile = fs.readFileSync(filePath);
  const events = JSON.parse(eventsFile);

  for (const event of events) {
    try {
      const receipt = await processCloudEvent(event);
      console.log(receipt);
    } catch (e) {
      console.log(e);
    }
  }
}

try {
  await main(...process.argv.slice(2));
} catch (err) {
  console.error(err);
  process.exitCode = 1;
}

console.log("Done");
