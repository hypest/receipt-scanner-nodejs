import fs from 'fs';
import { Buffer } from 'buffer';
import { v1 } from '@google-cloud/documentai';
const { DocumentProcessorServiceClient } = v1;

import { projectId, location, processorId } from "./gcloud-config.js";

async function processDocument(projectId, location, processorId, filePath, mimeType) {
    const documentaiClient = new DocumentProcessorServiceClient({
        apiEndpoint: 'eu-documentai.googleapis.com'
    });

    const resourceName = documentaiClient.processorPath(projectId, location, processorId);

    const imageFile = fs.readFileSync(filePath);

    const encodedImage = Buffer.from(imageFile).toString('base64');

    const rawDocument = {
        content: encodedImage,
        mimeType: mimeType,
    };

    const request = {
        name: resourceName,
        rawDocument: rawDocument
    };

    const [result] = await documentaiClient.processDocument(request);

    return result.document;
}

// run like this: node hand-run.js image_filename 'image/jpeg'
async function main(filePath, mimeType) {
    const document = await processDocument(projectId, location, processorId, filePath, mimeType);
    console.log("Document Processing Complete");

    console.log(`Text: ${document.text}`);
}

main(...process.argv.slice(2)).catch(err => {
    console.error(err);
    process.exitCode = 1;
});