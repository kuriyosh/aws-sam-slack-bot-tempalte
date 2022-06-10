const { parsePayload, responseMessage } = require("slackbot-utils");

exports.lambdaHandler = async (event, context, callback) => {
  return await main(event);
};

const main = async (event) => {
  const payload = parsePayload(event["body"]);
  const text = payload.text;
  const responseUrl = payload.response_url;

  try {
    await responseMessage(responseUrl, text);
  } catch (e) {
    await responseMessage(
      responseUrl,
      "問題が発生しました。時間を空けてもう一度実行してください。"
    );
    console.log(e);
    return;
  }

  return;
};
