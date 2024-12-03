import functions from "@google-cloud/functions-framework";

import { detectAndWrite } from "./processCloudEvent.js";
import { log } from "./log.js";

function shouldProcessCloudEvent(cloudEvent) {
  const eventAge = Date.now() - Date.parse(cloudEvent.time);
  const eventMaxAge = 10000;

  // Ignore events that are too old
  return eventAge < eventMaxAge;
}

function handleCloudEvent(cloudEvent) {
  if (!shouldProcessCloudEvent(cloudEvent)) {
    console.log(`Dropping event ${cloudEvent} with age ${eventAge} ms.`);
    return;
  }

  log(cloudEvent);

  detectAndWrite(cloudEvent);
}

// Register a CloudEvent callback with the Functions Framework that will
// be triggered by Cloud Storage.
functions.cloudEvent("helloGCS", (cloudEvent, callback) => {
  try {
    handleCloudEvent(cloudEvent);
  } catch (e) {
    log(e);
  }

  callback();
});
