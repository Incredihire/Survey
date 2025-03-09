@echo off

:: Load environment variables
call load-env.bat

:: Run CDK deploy with all parameters as context values
echo Running CDK deploy...
cdk deploy --context commitSha=%COMMIT_SHA% ^
           --context backendEcrRepoUri=%BACKEND_ECR_REPO_URI% ^
           --context frontendEcrRepoUri=%FRONTEND_ECR_REPO_URI% ^
           --context certificateArn=%CERTIFICATE_ARN% ^
           --context awsAccountId=%AWS_ACCOUNT_ID% ^
           --context awsRegion=%AWS_REGION%