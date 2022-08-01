const { DynamoDB, Lambda } = require("aws-sdk");

exports.handler = async function (event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // Need to explicitly tell this function where to find lambda and
  // dynamo in localstack, otherwise it will try to access real aws
  // resources and fail.
  // see: https://github.com/localstack/localstack/issues/5866#issuecomment-1100607635
  const isLocal = !!process.env.LOCALSTACK_HOSTNAME;
  const initOpts = !isLocal
    ? undefined
    : { endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566` };

  // create AWS SDK clients
  const dynamo = new DynamoDB(initOpts);
  const lambda = new Lambda(initOpts);

  // update dynamo entry for "path" with hits++
  await dynamo
    .updateItem({
      TableName: process.env.HITS_TABLE_NAME,
      Key: { path: { S: event.path } },
      UpdateExpression: "ADD hits :incr",
      ExpressionAttributeValues: { ":incr": { N: "1" } },
    })
    .promise();

  // call downstream function and capture response
  const resp = await lambda
    .invoke({
      FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
      Payload: JSON.stringify(event),
    })
    .promise();

  console.log("downstream response:", JSON.stringify(resp, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(resp.Payload);
};
