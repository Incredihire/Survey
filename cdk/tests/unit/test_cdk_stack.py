import os
import aws_cdk as cdk
import aws_cdk.assertions as assertions

from cdk.cdk_stack import FastApiFargateStack

# example tests. To run these tests, uncomment this file along with the example
# resource in cdk/cdk_stack.py
def test_sqs_queue_created():
    # Get values from environment variables with fallbacks for CI/testing
    aws_account_id = os.environ.get("AWS_ACCOUNT_ID", "123456789012")
    aws_region = os.environ.get("AWS_REGION", "us-west-2")
    commit_sha = os.environ.get("COMMIT_SHA", "latest")
    certificate_arn = os.environ.get("CERTIFICATE_ARN", 
                                    f"arn:aws:acm:{aws_region}:{aws_account_id}:certificate/example-cert")
    app = cdk.App(context={
        "backend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_backend",
        "frontend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_frontend",
        "commit_sha": commit_sha,
        "certificate_arn": certificate_arn
    })
    stack = FastApiFargateStack(app, "SurveyStack")
    template = assertions.Template.from_stack(stack)

    # Add your assertions here
    template.has_resource("AWS::EC2::VPC", {})
    template.has_resource("AWS::ECS::Cluster", {})
    # Add more specific assertions as needed
