const { Action, io } = require('@interval/sdk');
const aws = require('aws-sdk');
const uuid = require('uuid');
const { get } = require('lodash');
const convert = require('xml-js');
const { sendChatMessage } = require('../utils/amazon-q');
const users = require('../data/users.json');
const logger = require('../utils/logger');
const { AWS_REGION } = require('../config');
const { upsert } = require('../utils/pinecone');

const {
  QBusinessClient,
  ListApplicationsCommand,
  ChatSyncCommand,
} = require('@aws-sdk/client-qbusiness');

const client = new QBusinessClient({
  region: AWS_REGION,
});

module.exports = new Action(async () => {
  const { user, file, prompt } = await io.group({
    user: io.select.single('User', {
      options: users,
      defaultValue: get(users, '0', null),
    }),
    file: io.input.file('Upload a file to analize'),
    prompt: io.input.text('Prompt', {
      defaultValue: `Summarize this document for me. Give me as much detail as possible. Like document type, full dates, opening and closing balances numbers, etc.`,
    }),
  });
  logger.info('Starting to send chat message to amazon-q');
  const data = await sendChatMessage({
    userMessage: prompt,
    attachments: [
      {
        data: await file.buffer(),
        name: file.name,
      },
    ],
    userId: get(user, 'value', 'default'),
  });
  const parsedRespone = get(data, 'systemMessage', '');
  logger.info('Parsed Respone::', parsedRespone);
  await upsert({
    metadata: {
      source: `${user.value}/${file.name}`,
      namespace: user.value,
    },
    pageContent: parsedRespone,
  });
  return parsedRespone;
});
