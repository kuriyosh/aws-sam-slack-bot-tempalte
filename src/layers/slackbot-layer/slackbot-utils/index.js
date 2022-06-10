const { createHmac } = require("crypto");
const { parse } = require("query-string");
const axios = require("axios");

exports.verifySignature = (event, secret) => {
  const headers = event["headers"];

  if (
    !("X-Slack-Request-Timestamp" in headers) ||
    !("X-Slack-Signature" in headers)
  ) {
    const error = new Error("invalid header");
    throw error;
  }

  const timestamp = headers["X-Slack-Request-Timestamp"];
  const signature = headers["X-Slack-Signature"];
  const body = event["body"];
  const hash = `v0:${timestamp}:${body}`;
  const expectSignature =
    "v0=" +
    createHmac("sha256", secret) /* secret signed should not be hard coded */
      .update(hash)
      .digest("hex");

  return signature === expectSignature;
};

exports.parsePayload = (payload) => {
  return parse(payload);
};

exports.responseMessage = async (url, message) => {
  await axios.post(url, {
    text: message,
    response_type: "in_channel",
  });
};
