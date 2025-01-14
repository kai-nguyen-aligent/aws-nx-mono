import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Function } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

interface HelloCdkStackProps extends cdk.StackProps {
  readonly lambdaProps: Omit<NodejsFunctionProps, 'entry'>;
}

export class HelloCdkStack extends cdk.Stack {
  private readonly lambdaFunctions: NodejsFunction[];
  private readonly apiGateway: LambdaRestApi;

  constructor(scope: Construct, id: string, props: HelloCdkStackProps) {
    super(scope, id, props);

    this.lambdaFunctions = [
      new NodejsFunction(this, 'HelloLambda', {
        entry: './src/lambda/hello.ts',
        ...props.lambdaProps,
      }),
      new NodejsFunction(this, 'GoodbyeLambda', {
        entry: './src/lambda/cdk.ts',
        ...props.lambdaProps,
      }),
      new Function(this, 'RolldownLambda', {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: 'rolldown.handler',
        code: new cdk.aws_lambda.AssetCode('./.rolldown'),
        ...props.lambdaProps,
      }),
    ];

    this.apiGateway = new LambdaRestApi(this, 'HelloApi', {
      handler: this.lambdaFunctions[0],
      proxy: false,
    });

    this.apiGateway.root
      .addResource('hello')
      .addMethod(
        'POST',
        new cdk.aws_apigateway.LambdaIntegration(this.lambdaFunctions[0])
      );

    this.apiGateway.root
      .addResource('cdk')
      .addMethod(
        'GET',
        new cdk.aws_apigateway.LambdaIntegration(this.lambdaFunctions[1])
      );
  }
}
