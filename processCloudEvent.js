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

export async function processCloudEvent(cloudEvent) {
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
  try {
    await bigquery.dataset(datasetId).table(tableId).insert(flattenItems);
  } catch (e) {
    log(e);
    log(document.entities);
  }

  console.log("Data inserted into BigQuery");
}
