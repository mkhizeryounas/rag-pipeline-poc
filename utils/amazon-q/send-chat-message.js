const dotenv = require('dotenv');
const uuid = require('uuid');

const {
  QBusinessClient,
  ListApplicationsCommand,
  ChatSyncCommand,
} = require('@aws-sdk/client-qbusiness');

dotenv.config();

const client = new QBusinessClient({
  region: process.env.AWS_REGION,
});

const sendChatMessage = (options = { userMessage: 'Hello World!' }) => {
  const params = {
    applicationId: '278a71a0-6a76-484c-9420-30719f633aa6',
    clientToken: uuid.v4(),
    userId: '123',
    ...options,
  };
  const command = new ChatSyncCommand(params);
  return client.send(command);
};

module.exports = sendChatMessage;

if (require.main === module) {
  (async () => {
    const data = await sendChatMessage({
      // userMessage:
      //   'How did Businesses-of-One manage to increase revenue while also facing a substantial rise in expenses during the first half of 2023?',
      userMessage: 'How to connect quickbooks?',
      // attributeFilter: {
      //   equalsTo: {
      //     name: '_source_uri',
      //     value: {
      //       stringValue:
      //         'https://www.collective.com/blog/beating-the-odds-u-s-solopreneurs-find-success-amid-economic-challenges',
      //     },
      //   },
      // },
    });
    console.log(data);
  })();
}
