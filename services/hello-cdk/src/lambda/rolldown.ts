import { Handler } from 'aws-lambda';

export const lambdaHandler: Handler<object, object> = async (event) => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));

  return {};
};
