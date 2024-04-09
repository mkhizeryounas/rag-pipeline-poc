const { Pinecone } = require('@pinecone-database/pinecone');
const { PINECONE_API_KEY, PINECONE_ENV } = require('../../config');

module.exports = new Pinecone({
  apiKey: PINECONE_API_KEY,
});
