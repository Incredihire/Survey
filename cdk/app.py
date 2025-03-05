import os
import sys
import aws_cdk as cdk
from cdk.cdk_stack import FastApiFargateStack
#!/usr/bin/env python3

# Get environment variables
aws_account_id = os.environ.get("AWS_ACCOUNT_ID")
aws_region = os.environ.get("AWS_REGION")
commit_sha = os.environ.get("COMMIT_SHA", "latest")
certificate_arn = os.environ.get("CERTIFICATE_ARN", "")

# Check for required environment variables
if not aws_account_id or not aws_region:
    print("ERROR: AWS_ACCOUNT_ID and AWS_REGION environment variables must be set.")
    print("Please set these variables and try again.")
    sys.exit(1)

# Create app with context
context = {
    "commit_sha": commit_sha,
    "certificate_arn": certificate_arn,
    "backend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey-backend",
    "frontend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey-frontend"
}

app = cdk.App(context=context)

# Create the stack with environment
env = cdk.Environment(account=aws_account_id, region=aws_region)
FastApiFargateStack(
    app, 
    "SurveyStack",
    env=env,
    description="Survey application stack"
)

app.synth()