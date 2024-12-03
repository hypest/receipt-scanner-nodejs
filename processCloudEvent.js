import { BigQuery } from "@google-cloud/bigquery";

import { v1 } from "@google-cloud/documentai";
const { DocumentProcessorServiceClient } = v1;

import { log } from "./log.js";
import { parseReceipt } from "./parse_receipt.js";
import {
  projectId,
  location,
  processorId,
  datasetId,
  tableId,
} from "./gcloud-config.js";

export async function processDocumentAI(gcsFile) {
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
    gcsUri: `gs://${gcsFile.bucket}/${gcsFile.name}`,
    mimeType: gcsFile.contentType,
  };

  const request = {
    name: resourceName,
    gcsDocument,
  };

  const result = await documentaiClient.processDocument(request);
  const { document } = result[0];

  return document;
}

export async function writeBigQuery(payload) {
  const bigquery = new BigQuery();

  // Insert data into a table
  try {
    await bigquery.dataset(datasetId).table(tableId).insert(payload);
    console.log("Data inserted into BigQuery");
  } catch (e) {
    log(e);
    log(payload);
  }
}

export async function processCloudEvent(cloudEvent) {
  const gcsFile = cloudEvent.data;

  const document = await processDocumentAI(gcsFile);

  const flattenItems = parseReceipt(document.entities);
  log(flattenItems);

  return flattenItems;
}

export async function detectAndWrite(cloudEvent) {
  const flattenItems = processCloudEvent(cloudEvent);

  writeBigQuery(flattenItems);
}
