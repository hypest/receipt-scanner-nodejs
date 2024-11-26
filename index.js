import fs from 'fs';
import { Buffer } from 'buffer';
import { v1 } from '@google-cloud/documentai';
const { DocumentProcessorServiceClient } = v1;

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

async function main() {
    const projectId = '<project id here>';
    const location = 'eu';
    const processorId = '<processor id here>';

    const filePath = '<put an image filename here>';
    const mimeType = 'image/jpeg';

    const document = await processDocument(projectId, location, processorId, filePath, mimeType);
    console.log("Document Processing Complete");

    console.log(`Text: ${document.text}`);
}

main(...process.argv.slice(2)).catch(err => {
    console.error(err);
    process.exitCode = 1;
});