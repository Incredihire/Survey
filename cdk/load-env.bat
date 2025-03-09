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

:: Export variables to parent process
endlocal & (
    set "COMMIT_SHA=%COMMIT_SHA%"
    set "AWS_ACCOUNT_ID=%AWS_ACCOUNT_ID%"
    set "AWS_REGION=%AWS_REGION%"
    set "BACKEND_ECR_REPO_URI=%BACKEND_ECR_REPO_URI%"
    set "FRONTEND_ECR_REPO_URI=%FRONTEND_ECR_REPO_URI%"
    set "CERTIFICATE_ARN=%CERTIFICATE_ARN%"
    set "HOSTED_ZONE_ID=%HOSTED_ZONE_ID%"
)