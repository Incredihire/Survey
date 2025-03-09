#!/usr/bin/env python3
import aws_cdk as cdk
import os
from cdk.cdk_stack import FastApiFargateStack

app = cdk.App()
# Get context values first, then fall back to environment variables
commit_sha = app.node.try_get_context("commitSha") or os.environ.get("COMMIT_SHA", "latest")
backend_ecr_repo_uri = app.node.try_get_context("backendEcrRepoUri") or os.environ.get("BACKEND_ECR_REPO_URI", "")
frontend_ecr_repo_uri = app.node.try_get_context("frontendEcrRepoUri") or os.environ.get("FRONTEND_ECR_REPO_URI", "")
certificate_arn = app.node.try_get_context("certificateArn") or os.environ.get("CERTIFICATE_ARN", "")
hosted_zone_id = app.node.try_get_context("hostedZoneId") or os.environ.get("HOSTED_ZONE_ID", "")
aws_account_id = app.node.try_get_context("awsAccountId") or os.environ.get("AWS_ACCOUNT_ID")
aws_region = app.node.try_get_context("awsRegion") or os.environ.get("AWS_REGION")

# Create the stack with the appropriate environment
if aws_account_id and aws_region:
    env = cdk.Environment(account=aws_account_id, region=aws_region)
    FastApiFargateStack(
        app,
        "SurveyStack",
        env=env,
        backend_ecr_repo_uri=backend_ecr_repo_uri,
        frontend_ecr_repo_uri=frontend_ecr_repo_uri,
        commit_sha=commit_sha,
        certificate_arn=certificate_arn,
        hosted_zone_id=hosted_zone_id,
    )
else:
    # Fallback for when environment variables are not set
    print("ERROR: AWS_ACCOUNT_ID or AWS_REGION environment variables are not set.")
    exit(1)

app.synth()