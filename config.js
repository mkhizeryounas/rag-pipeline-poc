require('dotenv').config(); // loads environment variables from .env

module.exports = {
  INTERVAL_API_KEY: process.env.INTERVAL_API_KEY,
  AWS_REGION: process.env.AWS_REGION,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_ENV: process.env.PINECONE_ENV,
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
