# Local Debug

- https://erkamalofficial.medium.com/how-to-debug-aws-cdk-typescript-app-with-vscode-debugger-d2f31f8e70
- https://dev.to/ianbrumby/effortless-debugging-aws-cdk-typescript-projects-in-vscode-5hj4
- https://aws.amazon.com/blogs/compute/better-together-aws-sam-and-aws-cdk/
- https://stackoverflow.com/questions/64689865/debugging-lambda-locally-using-cdk-not-sam
- https://madurapperuma.medium.com/debugging-aws-cdk-lambda-in-vs-code-2ea626725646

# Comparison

## AWS SAM

- [+] Serverless oriented, Simplified infrastructure definition
- [+] Local development & testing
- [+] Interchange with CloudFormation
- [?] Rapid development & self documented using Infrastructure Composer (also means we will rely on it)
- [-] Less flexible due to YAML & TOML format
- [-] Limited support for Lambda bundling: `esbuild` & `Makefile`. Even `esbuild` support is limited than AWS CDK.
  - `SourcesContent` is set to `false` but the output map still contains source contents.m

## AWS CDK

- [+] Familiar programming language: Typescript
- [+] Enhanced development productivity by working with loops, objects, and types
- [+] More flexible with reusable components and infrastructure logic control
- [-] Limited support for Lambda bundling, only `esbuild`. The level of support is better than AWS SAM though.
- [-] Requires a bootstrapped environment in each AWS account.
- [?] "Natively" support local development & testing via AWS SAM
  - We need a separate `debug-bundle` step which utilise `esbuild` for debug bundling.
- [+] Easy [custom bundling script](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html#running-a-custom-build-script-as-part-of-cdk-synthesis). This is good when we want to bundle to ESM (`esbuild` support for ESM is not great while `rolldown` is now in beta phase and soon become Vite's default bundler)

# Challenges

- We need to think about how we can validate our convention.
  - Maybe switching to `cfn-lint`: https://github.com/aws-cloudformation/cfn-lint
  - Utilise AWS serverless rules and write our own: https://awslabs.github.io/serverless-rules/cfn-lint/
