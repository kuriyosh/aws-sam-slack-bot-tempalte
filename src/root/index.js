const { verifySignature } = require("slackbot-utils");
const AWS = require("aws-sdk");

const SIGNINGS_SECRET = process.env.SIGNINGS_SECRET;
const ECHO_FUNCTION_NAME = process.env.ECHO_FUNCTION_NAME;

exports.lambdaHandler = async (event, context, callback) => {
  try {
    if (!verifySignature(event, SIGNINGS_SECRET)) {
      return buildResponse(400, {
        message: "invalid signature",
      });
    }
  } catch (e) {
    return buildResponse(400, e);
  }

  // determine which function should be executed
  let functionName = "";
  switch (event.path) {
    case "/echo":
      functionName = ECHO_FUNCTION_NAME;
      break;
    default:
      return buildResponse(404, { message: "Not found" });
  }

  // execute other lambdas
  try {
    const res = await invokeLambda(functionName, event);
    console.log(res);
  } catch (e) {
    console.log(e);
  }

  return { statusCode: 202 };
};

const buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
  };
};

const invokeLambda = async (functionName, event) => {
  const lambda = new AWS.Lambda();
  const res = await lambda
    .invoke({
      FunctionName: functionName,
      InvocationType: "Event",
      Payload: JSON.stringify(event),
    })
    .promise();
  return res;
};
