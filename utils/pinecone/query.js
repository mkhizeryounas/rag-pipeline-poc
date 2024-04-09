const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { OpenAI } = require('langchain/llms/openai');
const { loadQAStuffChain } = require('langchain/chains');
const { Document } = require('langchain/document');
const client = require('./client');
const { OPENAI_API_KEY, PINECONE_INDEX_NAME } = require('../../config');
const logger = require('../logger');
const { get } = require('lodash');

module.exports = async (
  question,
  namespace,
  isPromptTemplateEnabled = false
) => {
  logger.info(`Namespace: ${namespace}`);
  logger.info(`Question: ${question}`);
  logger.info('Querying Pinecone vector store...');
  const index = client.Index(PINECONE_INDEX_NAME).namespace(namespace);
  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);
  let queryResponse = await index.query({
    topK: 10,
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,
  });
  logger.info(`Found ${queryResponse.matches.length} matches...`);
  logger.info(`Asking question: ${question}...`);
  if (queryResponse.matches.length) {
    const llm = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
    const chain = loadQAStuffChain(llm);
    const concatenatedPageContent = queryResponse.matches
      .map((match) => match.metadata.pageContent)
      .join(' ');
    const promptTemplate = `
      You are a helpful assistant for a company called Collective Hub Inc. You help with searching for information in documents. You have been asked the following question: ${question}

      Some things to note while answering the question:
      - The answer should be as detailed as possible.
      - The answer should be in a professional tone.
      - If information can be denoted in lists, please do so.
    `;
    const result = await chain.call({
      input_documents: [new Document({ pageContent: concatenatedPageContent })],
      question: isPromptTemplateEnabled ? promptTemplate : question,
    });
    const source = get(queryResponse.matches, '0.metadata.source', '');
    return `Answer: ${result.text} \n\nSource: ${source}`;
  } else {
    return 'Since there are no matches, GPT-3 will not be queried.';
  }
};
