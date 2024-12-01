import functions from "@google-cloud/functions-framework";
import { v1 } from "@google-cloud/documentai";
const { DocumentProcessorServiceClient } = v1;

import { parseReceipt } from "./parse_receipt.js";

import {
  projectId,
  location,
  processorId,
  datasetId,
  tableId,
} from "./gcloud-config.js";

import { BigQuery } from "@google-cloud/bigquery";

function log(message) {
  // Complete a structured log entry.
  const entry = Object.assign(
    {
      severity: "NOTICE",
      message:
        typeof message === "object" && message !== null
          ? JSON.stringify(message, null, 2)
          : message,
      // Log viewer accesses 'component' as 'jsonPayload.component'.
      component: "arbitrary-property",
    },
    {}
  );

  // Serialize to a JSON string and output.
  console.log(JSON.stringify(entry));
}

// Register a CloudEvent callback with the Functions Framework that will
// be triggered by Cloud Storage.
functions.cloudEvent("helloGCS", async (cloudEvent, callback) => {
  const eventAge = Date.now() - Date.parse(cloudEvent.time);
  const eventMaxAge = 10000;

  // Ignore events that are too old
  if (eventAge > eventMaxAge) {
    console.log(`Dropping event ${cloudEvent} with age ${eventAge} ms.`);
    callback();
    return;
  }

  log(cloudEvent);

  const file = cloudEvent.data;

  const documentaiClient = new DocumentProcessorServiceClient({
    apiEndpoint: "eu-documentai.googleapis.com",
  });

  const resourceName = documentaiClient.processorPath(
    projectId,
    location,
    processorId
  );
  console.log(resourceName);

  const gcsDocument = {
    gcsUri: `gs://${file.bucket}/${file.name}`,
    mimeType: file.contentType,
  };

  const request = {
    name: resourceName,
    gcsDocument,
  };

  const result = await documentaiClient.processDocument(request);

  const { document } = result[0];

  // log(document.entities);
  const flattenItems = parseReceipt(document.entities);
  log(flattenItems);

  const bigquery = new BigQuery();

  // Insert data into a table
  await bigquery.dataset(datasetId).table(tableId).insert(flattenItems);
});
