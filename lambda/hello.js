exports.handler = async function (event) {
  console.log("request:", JSON.stringify(event, null, 2));
  return {
    statusCode: 200,
    headers: { "Content-type": "text/plain" },
    body: `Hello, CDK! You've hit ${process.env.DOWNSTREAM_FUNCTION_NAME}\n`,
  };
};
