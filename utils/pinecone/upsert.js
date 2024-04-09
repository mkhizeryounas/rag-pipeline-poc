const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const logger = require('../logger');
const client = require('./client');
const { PINECONE_INDEX_NAME } = require('../../config');

/**
 * @param {
 *  metadata: {
 *    source: string, // Path to the document
 *    namespace: string, // User ID to namespace the index
 *  },
 *  pageContent: string, // Text content of the document
 *  } doc | Document to be upserted
 */
module.exports = async (doc) => {
  logger.info('Retrieving Pinecone index...');
  const { source, namespace } = doc.metadata;
  const text = doc.pageContent;
  const index = client.Index(PINECONE_INDEX_NAME).namespace(namespace);
  logger.info(
    `Pinecone index retrieved: ${PINECONE_INDEX_NAME} with namespace ${namespace}`
  );
  logger.info(`Processing document: ${doc.metadata.source}`);
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });
  logger.info('Splitting text into chunks...');
  const chunks = await textSplitter.createDocuments([text]);
  logger.info(`Text split into ${chunks.length} chunks`);
  logger.info(
    `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`
  );
  const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
    chunks.map((chunk) => chunk.pageContent.replace(/\n/g, ' '))
  );
  logger.info('Finished embedding documents');
  logger.info(
    `Creating ${chunks.length} vectors array with id, values, and metadata...`
  );
  const batchSize = 100;
  let batch = [];
  for (let idx = 0; idx < chunks.length; idx++) {
    const chunk = chunks[idx];
    const vector = {
      id: `${source}_${idx}`,
      values: embeddingsArrays[idx],
      metadata: {
        ...chunk.metadata,
        loc: JSON.stringify(chunk.metadata.loc),
        pageContent: chunk.pageContent,
        source,
        namespace,
      },
    };
    batch.push(vector);
    if (batch.length === batchSize || idx === chunks.length - 1) {
      await index.upsert(batch);
      batch = [];
    }
  }
  logger.info(`Pinecone index updated with ${chunks.length} vectors`);
};
