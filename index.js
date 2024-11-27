import functions from '@google-cloud/functions-framework';
import { Storage } from '@google-cloud/storage';
import { v1 } from '@google-cloud/documentai';
const { DocumentProcessorServiceClient } = v1;
import fs from 'fs';
import { Buffer } from 'buffer';

import {
    projectId,
    location,
    processorId,
    datasetId,
    tableId,
} from "./gcloud-config.js";

import debug from '@google-cloud/debug-agent';
debug.start({
    allowExpressions: true
});
// debug.isReady().then(() => {
//     debugInitialized = true;
//     console.log("Debugger is initialize");
// });

import { BigQuery } from '@google-cloud/bigquery';

const tempfileName = 'tempfile.jpg';

async function downloadIntoMemory(storage, bucketName, fileName) {
  // Downloads the file into a buffer in memory.
  const contents = await storage.bucket(bucketName).file(fileName).download();

//   console.log(
//     `Contents of gs://${bucketName}/${fileName} are ${contents.toString()}.`
//   );
    return contents;
}

async function downloadFile(storage, bucketName, fileName) {
  const options = {
    destination: tempfileName,
  };

  // Downloads the file
  await storage.bucket(bucketName).file(fileName).download(options);

//   console.log(
//     `gs://${bucketName}/${fileName} downloaded to ${destFileName}.`
//   );
}

// Register a CloudEvent callback with the Functions Framework that will
// be triggered by Cloud Storage.
functions.cloudEvent('helloGCS', async cloudEvent => {
  console.log(`Event ID: ${cloudEvent.id}`);
  console.log(`Event Type: ${cloudEvent.type}`);

  const file = cloudEvent.data;
  console.log(`Bucket: ${file.bucket}`);
  console.log(`File: ${file.name}`);
  console.log(`Metageneration: ${file.metageneration}`);
  console.log(`Created: ${file.timeCreated}`);
  console.log(`Updated: ${file.updated}`);

  const storage = new Storage();

//   const contents = await storage.bucket(file.bucket).file(file.name).download();
//     const encodedImage = Buffer.from(contents).toString('base64');

  downloadFile(storage, file.bucket, file.name).catch(console.error);
  const imageFile = fs.readFileSync(tempfileName);
  const encodedImage = Buffer.from(imageFile).toString('base64');


    const documentaiClient = new DocumentProcessorServiceClient({
        apiEndpoint: 'eu-documentai.googleapis.com'
    });

    const resourceName = documentaiClient.processorPath(projectId, location, processorId);
    console.log(resourceName);

    const rawDocument = {
        content: encodedImage,
        mimeType: 'image/jpeg'
    };
    console.log(rawDocument);

    const request = {
        name: resourceName,
        rawDocument: rawDocument
    };

    const result = await documentaiClient.processDocument(request);

    const { document } = result[0];

    console.log(JSON.stringify(document.entities));
    // console.log(document.text);
    // console.log(result);

    const bigquery = new BigQuery();
    const rows = [
        {
            item_code: '123',
            item_price: 3.2,
            InvoiceID: 'test1',
        },
        {
            item_code: '456',
            item_price: 5.2,
            InvoiceID: 'test2',
        },
    ];

    // Insert data into a table
    await bigquery
        .dataset(datasetId)
        .table(tableId)
        .insert(rows);
    // console.log(`Inserted ${rows.length} rows`);
});
