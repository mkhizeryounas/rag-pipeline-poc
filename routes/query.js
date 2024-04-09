const { Action, io } = require('@interval/sdk');
const { query } = require('../utils/pinecone');
const users = require('../data/users.json');
const { get } = require('lodash');

module.exports = new Action(async () => {
  const { question, user, isPromptTemplateEnabled } = await io.group({
    user: io.select.single('User', {
      options: users,
      defaultValue: get(users, '0', null),
    }),
    question: io.input.text('Question', {
      defaultValue: `What is the closing balance on each accounts in the month of December 23?`,
    }),
    isPromptTemplateEnabled: io.input.boolean('Is prompt template enabled?', {
      defaultValue: true,
    }),
  });
  return query(
    question,
    get(user, 'value', 'default'),
    isPromptTemplateEnabled
  );
});
