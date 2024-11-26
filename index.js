import fs from "fs";
import { Buffer } from "buffer";
import functions from "@google-cloud/functions-framework";
import { Storage } from "@google-cloud/storage";
import { v1 } from "@google-cloud/documentai";
const { DocumentProcessorServiceClient } = v1;

import { projectId, location, processorId } from "./gcloud-config.js";

const tempfileName = "tempfile.jpg";

async function downloadFile(storage, bucketName, fileName) {
  await storage.bucket(bucketName).file(fileName).download({
    destination: tempfileName,
  });
}

// Register a CloudEvent callback with the Functions Framework that will
// be triggered by Cloud Storage.
functions.cloudEvent("helloGCS", async (cloudEvent) => {
  console.log(`Event ID: ${cloudEvent.id}`);
  console.log(`Event Type: ${cloudEvent.type}`);

  const file = cloudEvent.data;
  console.log(`Bucket: ${file.bucket}`);
  console.log(`File: ${file.name}`);
  console.log(`Metageneration: ${file.metageneration}`);
  console.log(`Created: ${file.timeCreated}`);
  console.log(`Updated: ${file.updated}`);

  const storage = new Storage();

  downloadFile(storage, file.bucket, file.name).catch(console.error);
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
  // console.log(resourceName);

  const rawDocument = {
    content: encodedImage,
    mimeType: "image/jpeg",
  };
  // console.log(rawDocument);

  const request = {
    name: resourceName,
    rawDocument: rawDocument,
  };

  const result = await documentaiClient.processDocument(request);

  console.log(result);
});
