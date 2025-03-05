import os
import aws_cdk as cdk
from cdk.cdk_stack import FastApiFargateStack
#!/usr/bin/env python3

app = cdk.App()

# Get environment variables
aws_account_id = os.environ.get("AWS_ACCOUNT_ID")
aws_region = os.environ.get("AWS_REGION")
commit_sha = os.environ.get("COMMIT_SHA", "latest")
certificate_arn = os.environ.get("CERTIFICATE_ARN", "")

# Set context values from environment variables
if aws_account_id and aws_region:
    env = cdk.Environment(account=aws_account_id, region=aws_region)
    FastApiFargateStack(
        app, 
        "SurveyStack",
        env=env,
        description="Survey application stack",
        # Pass context values to the stack
        context={
            "commit_sha": commit_sha,
            "certificate_arn": certificate_arn,
            "backend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey-backend",
            "frontend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey-frontend"
        }
    )
else:
    # Fallback for when environment variables are not set
    print("WARNING: AWS_ACCOUNT_ID or AWS_REGION environment variables are not set.")
    print("The stack will be environment-agnostic and may not deploy correctly.")
    FastApiFargateStack(app, "SurveyStack")

app.synth()
