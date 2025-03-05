#!/usr/bin/env python3
import os
import sys
import aws_cdk as cdk
from cdk.cdk_stack import FastApiFargateStack

app = cdk.App()
# Get environment variables
aws_account_id = os.environ.get("AWS_ACCOUNT_ID")
aws_region = os.environ.get("AWS_REGION")

# Get context values
commit_sha = app.node.try_get_context("commitSha") or os.environ.get("COMMIT_SHA", "latest")
backend_ecr_repo_uri = app.node.try_get_context("backendEcrRepoUri")
frontend_ecr_repo_uri = app.node.try_get_context("frontendEcrRepoUri")
certificate_arn = app.node.try_get_context("certificateArn") or os.environ.get("CERTIFICATE_ARN", "")

# Print debug information
print(f"AWS Account ID: {aws_account_id}")
print(f"AWS Region: {aws_region}")
print(f"Commit SHA: {commit_sha}")
print(f"Backend ECR Repo URI: {backend_ecr_repo_uri}")
print(f"Frontend ECR Repo URI: {frontend_ecr_repo_uri}")
print(f"Certificate ARN: {certificate_arn}")

# Set context values from environment variables
if aws_account_id and aws_region:
    env = cdk.Environment(account=aws_account_id, region=aws_region)
    FastApiFargateStack(
        app, 
        "SurveyStack",
        env=env,
        backend_ecr_repo_uri=backend_ecr_repo_uri,
        frontend_ecr_repo_uri=frontend_ecr_repo_uri,
        commit_sha=commit_sha,
        certificate_arn=certificate_arn
    )
else:
    # Fallback for when environment variables are not set
    print("WARNING: AWS_ACCOUNT_ID or AWS_REGION environment variables are not set.")
    print("The stack will be environment-agnostic and may not deploy correctly.")
    FastApiFargateStack(app, "SurveyStack")

app.synth()