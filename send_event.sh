#!/bin/bash
curl localhost:8888 -v \
  -X POST \
  -H "Content-Type: application/json" \
  -H "ce-id: 12761621150588617" \
  -H "ce-specversion: 1.0" \
  -H "ce-time: 2024-11-28T22:28:56.763855Z" \
  -H "ce-type: google.cloud.storage.object.v1.finalized" \
  -H "ce-source: //storage.googleapis.com/projects/_/buckets/receipts-for-scanning" \
  -H "ce-subject: objects/20241128_175251.jpg" \
  -d '{
        "kind": "storage#object",
        "id": "receipts-for-scanning/20241128_175251.jpg/1732832936756275",
        "selfLink": "https://www.googleapis.com/storage/v1/b/receipts-for-scanning/o/20241128_175251.jpg",
        "name": "20241128_175251.jpg",
        "bucket": "receipts-for-scanning",
        "generation": "1732832936756275",
        "metageneration": "1",
        "contentType": "image/jpeg",
        "timeCreated": "2024-11-28T22:28:56.763Z",
        "updated": "2024-11-28T22:28:56.763Z",
        "storageClass": "STANDARD",
        "timeStorageClassUpdated": "2024-11-28T22:28:56.763Z",
        "size": "1829906",
        "md5Hash": "2MJk97vPNuLBcW1nghxIww==",
        "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/receipts-for-scanning/o/20241128_175251.jpg?generation=1732832936756275&alt=media",
        "crc32c": "6yY44A==",
        "etag": "CLOImt2JgIoDEAE="
    }'
