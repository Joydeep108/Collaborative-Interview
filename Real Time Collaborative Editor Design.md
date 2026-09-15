# Real Time Collaborative Editor

There are two user a interviewer and a candidate. They are both performed the editing a document at realtime, interviewer and candidate are in another geographical location or they are situated far from each other. There should also be happened that they are present at same location but thier machine is different.

### Goal
My goal is to create a collaborative real time editor with bare minimum delay.

### Data Flow:
1. User get into the interview, and open a new document. 
    - Request the server and a new document is created.
    - Store the metadata to the mongodb and also create a new S3 object.
        ```text
            Document Schema:
            ----------------------------
            id,
            docId,
            title,
            url(blob),
            createdAt,
            createdBy,
            interviewId,
            roomId,
        ```
    - Frontend calls GET /document/{docId} to the `storeDocumentMetaDataService()` service.
    - Frontend Fetch the document snapshot from S3 bolb storage.
    - Document show in read-only mode.

2. User starts editing.(Triggers websocket).
    - Frontend initiate the Websocket to `documentEditorService()` service.

3. Editor service handles websocket join.
    - Redis handle the document state every editing operations is performed in redis.
    - At first check to the in-memory database(redis) is there any document is present ?, if present that means editing is continue happenning. Send the latest canonical copy of the document after perform the OT(Operations Transformation).
    - If redis is empty that means there is currently no editing operations is going on, load the snapshot from the S3 and send to the user. Replay the unprocessed operations from kafka(v52-vN). 
    - If kafka is also empty that means snapshot is up-to-date.

4. Real time editing starts.
    - Editor Service:
        - Applies Operational Transformation(OT) to the file.
        - Updates the Redis(canonical doc) in real-time.
        - Broadcast these to the other users.
        - Streams each operations to the kafka for durability.

5. Background processing.
    - Kafka operation consumer service:
        - it accepts all the changes (insert/delete to the document) and save metadata to the database.
        - Frontend send these types of data to the server.
            ```json
                {
                    "type": "insert",
                    "position": 35,
                    "text": " "
                }
            ```
            ```txt
                Operation Schema:
                ---------------------------------
                docId,
                timestamp,
                type,
                position,
                text,
                requestedBy,
            ```
6. Auto save functionality.
    - We give user two types of functionality auto save and mannual save.
    - Autosave: saving the document after 10-15 sec delay. And every time we create a new version after saving to the S3
    - For every 10-20 sec delay of autosaving create a `versionSchema` to the DB.
        ```text
            Version Schema:
            ----------------------------
            id,
            docId,
            title,
            versionId,
            url(blob),
            modifiedAt,
            createdAt,
            createdBy,
            interviewId,
            roomId,
        ```
7. After interview is ending all the version data and operations schema data are completely deleted and take the final copy of the document in the S3. and changes the final URL in the document schema url.
