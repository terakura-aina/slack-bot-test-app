const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // ソケットモードではポートをリッスンしませんが、アプリを OAuth フローに対応させる場合、
  // 何らかのポートをリッスンする必要があります
  port: process.env.PORT || 3000
});

// "運勢" を含むメッセージをリッスンします
app.message('運勢', async ({ message, say }) => {
  // イベントがトリガーされたチャンネルに say() でメッセージを送信します
  await say(`<@${message.user}>の今日の運勢は大吉です！`);
});

app.command("/registar", async ({ ack, body, client, logger }) => {
  await ack();
  try {
    const result = await client.views.open({
      // 適切な trigger_id を受け取ってから 3 秒以内に渡す
      trigger_id: body.trigger_id,
      // view の値をペイロードに含む
      view: {
        type: 'modal',
        callback_id: 'registar-test',
        title: {
          type: 'plain_text',
          text: '登録する',
          emoji: true
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
          emoji: true
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
          emoji: true
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '登録すると毎日占いの結果が届きます'
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'input',
            block_id: 'full_name',
            element: {
              type: 'plain_text_input',
              action_id: 'plain_text_input-action'
            },
            label: {
              type: 'plain_text',
              text: 'フルネーム',
              emoji: true
            }
          },
          {
            type: 'input',
            block_id: 'mail_address',
            element: {
              type: 'email_text_input',
              action_id: 'email_text_input-action'
            },
            label: {
              type: 'plain_text',
              text: 'メールアドレス',
              emoji: true
            }
          },
          {
            type: 'input',
            block_id: 'date_of_barth',
            element: {
              type: 'datepicker',
              placeholder: {
                type: 'plain_text',
                text: 'Select a date',
                emoji: true
              },
              action_id: 'datepicker-action'
            },
            label: {
              type: 'plain_text',
              text: '生年月日',
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "channel_to_notify",
            element: {
                type: "conversations_select",
                action_id: "_",
                response_url_enabled: true,
                default_to_current_conversation: true,
            },
            "label": {
                "type": "plain_text",
                "text": "占いを送りたいチャンネル",
            },
          }
        ]
      }
    });
    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});

app.view('registar-test', async ({ ack, body, view, client, logger }) => {
  await ack();

  const fullName = view['state']['values']['full_name']['plain_text_input-action']['value'];
  const mailAddress = view['state']['values']['mail_address']['email_text_input-action']['value'];
  const dateOfBarth = view['state']['values']['date_of_barth']['datepicker-action']['selected_date'];
  const channel = view['state']['values']['channel_to_notify']['_']['selected_conversation'];
  console.log("fullName:",fullName)
  console.log("mailAddress:",mailAddress)
  console.log("dateOfBarth:",dateOfBarth)
  console.log("channel:",channel)
  const channelId = body['response_urls'][0]['channel_id']

  let msg = '登録が完了しました！';
  // ユーザーにメッセージを送信
  try {
    await app.client.chat.postMessage({
      channel: channelId,
      text: msg
    });
  }
  catch (error) {
    logger.error(error);
  }

});

(async () => {
  // アプリを起動します
  await app.start();

  console.log('⚡️ Bolt app is running!');
})();