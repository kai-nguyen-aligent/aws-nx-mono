import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  DefinitionBody,
  Pass,
  StateMachine,
  TaskInput,
  Wait,
  WaitTime,
} from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

interface HelloCdkStackProps extends cdk.StackProps {
  readonly lambdaProps: Omit<NodejsFunctionProps, 'entry'>;
}

export class HelloCdkStack extends cdk.Stack {
  private readonly apiGateway: LambdaRestApi;

  constructor(scope: Construct, id: string, props: HelloCdkStackProps) {
    super(scope, id, props);

    const helloLambda = new NodejsFunction(this, 'HelloLambda', {
      functionName: 'HelloLambda',
      entry: './src/lambda/hello.ts',
      ...props.lambdaProps,
    });

    const cdkLambda = new NodejsFunction(this, 'CdkLambda', {
      functionName: 'CdkLambda',
      entry: './src/lambda/cdk.ts',
      ...props.lambdaProps,
    });

    this.apiGateway = new LambdaRestApi(this, 'HelloApi', {
      handler: helloLambda,
      proxy: false,
    });

    this.apiGateway.root
      .addResource('hello')
      .addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(helloLambda));

    this.apiGateway.root
      .addResource('cdk')
      .addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(cdkLambda));

    const helloState = new LambdaInvoke(this, 'HelloState', {
      stateName: 'HelloState',
      lambdaFunction: helloLambda,
      outputPath: '$.hello',
    });

    const waitState = new Wait(this, 'WaitState', {
      stateName: 'WaitState',
      time: WaitTime.duration(cdk.Duration.seconds(3)),
    });

    const cdkState = new LambdaInvoke(this, 'CdkState', {
      stateName: 'CdkState',
      lambdaFunction: cdkLambda,
      payload: TaskInput.fromJsonPathAt('$.hello'),
      outputPath: '$.cdk',
    });

    const passState = new Pass(this, 'PassState');

    new StateMachine(this, 'StateMachine', {
      stateMachineName: 'HelloCdkStateMachine',
      definitionBody: DefinitionBody.fromChainable(
        helloState.next(waitState).next(cdkState).next(passState)
      ),
    });
  }
}
