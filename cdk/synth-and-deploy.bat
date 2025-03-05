@echo off
setlocal enabledelayedexpansion

:: Load environment variables from .env file
echo Loading environment variables from .env file...
for /f "tokens=1,* delims==" %%a in (..\.env) do (
    if not "%%a"=="" (
        set "%%a=%%b"
        echo Set %%a=%%b
    )
)

:: Display the COMMIT_SHA for verification
echo Using COMMIT_SHA: %COMMIT_SHA%
echo AWS Account ID: %AWS_ACCOUNT_ID%
echo AWS Region: %AWS_REGION%

:: Remove quotes from variables if they exist
set AWS_ACCOUNT_ID=%AWS_ACCOUNT_ID:"=%
set AWS_REGION=%AWS_REGION:"=%

:: Set ECR repository URIs based on AWS account and region
set "BACKEND_ECR_REPO_URI=%AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com/survey_backend"
echo Calculated BACKEND_ECR_REPO_URI=%BACKEND_ECR_REPO_URI%

set "FRONTEND_ECR_REPO_URI=%AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com/survey_frontend"
echo Calculated FRONTEND_ECR_REPO_URI=%FRONTEND_ECR_REPO_URI%

:: Now run the CDK commands with explicit context parameters
echo Running CDK synth...
cdk synth --context commitSha=%COMMIT_SHA% --context backendEcrRepoUri=%BACKEND_ECR_REPO_URI% --context frontendEcrRepoUri=%FRONTEND_ECR_REPO_URI% --context certificateArn=%CERTIFICATE_ARN%

if %ERRORLEVEL% NEQ 0 (
    echo CDK synth failed with errors. Please fix them before deploying.
    exit /b %ERRORLEVEL%
)

:: Add pause here to confirm before deploying
echo.
echo About to deploy with:
echo Commit SHA: %COMMIT_SHA%
echo Backend ECR URI: %BACKEND_ECR_REPO_URI%
echo Frontend ECR URI: %FRONTEND_ECR_REPO_URI%
echo Certificate ARN: %CERTIFICATE_ARN%
echo Press any key to continue with deployment or Ctrl+C to cancel...
pause > nul

:: Execute the deploy command
cdk deploy --require-approval never --context commitSha=%COMMIT_SHA% --context backendEcrRepoUri=%BACKEND_ECR_REPO_URI% --context frontendEcrRepoUri=%FRONTEND_ECR_REPO_URI% --context certificateArn=%CERTIFICATE_ARN%

endlocal