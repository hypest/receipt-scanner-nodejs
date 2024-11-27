import functions from "@google-cloud/functions-framework";
import { Storage } from "@google-cloud/storage";
import { v1 } from "@google-cloud/documentai";
const { DocumentProcessorServiceClient } = v1;
import fs from "fs";
import { Buffer } from "buffer";

import { parseReceipt } from "./parse_receipt.js";

import {
  projectId,
  location,
  processorId,
  datasetId,
  tableId,
} from "./gcloud-config.js";

import debug from "@google-cloud/debug-agent";
debug.start({
  allowExpressions: true,
});

import { BigQuery } from "@google-cloud/bigquery";

const tempfileName = "tempfile.jpg";

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

async function downloadIntoMemory(storage, bucketName, fileName) {
  // Downloads the file into a buffer in memory.
  const contents = await storage.bucket(bucketName).file(fileName).download();

  return contents;
}

async function downloadFile(storage, bucketName, fileName) {
  const options = {
    destination: tempfileName,
  };

  // Downloads the file
  await storage.bucket(bucketName).file(fileName).download(options);
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

  const storage = new Storage();

  //   const contents = await storage.bucket(file.bucket).file(file.name).download();
  //     const encodedImage = Buffer.from(contents).toString('base64');

  await downloadFile(storage, file.bucket, file.name).catch(console.error);
  const imageFile = fs.readFileSync(tempfileName);
  const encodedImage = Buffer.from(imageFile).toString("base64");

  const documentaiClient = new DocumentProcessorServiceClient({
    apiEndpoint: "eu-documentai.googleapis.com",
  });

  const resourceName = documentaiClient.processorPath(
    projectId,
    location,
    processorId
  );
  console.log(resourceName);

  const rawDocument = {
    content: encodedImage,
    mimeType: "image/jpeg",
  };

  const request = {
    name: resourceName,
    rawDocument: rawDocument,
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
