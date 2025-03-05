@echo off
setlocal enabledelayedexpansion

:: Load environment variables from .env file
for /f "tokens=*" %%a in (..\\.env) do (
    echo %%a
    set line=%%a
    if not "!line:~0,1!"=="#" (
        if not "!line!"=="" (
            set "%%a"
        )
    )
)

:: Now run the CDK commands
cdk synth
if %ERRORLEVEL% NEQ 0 (
    echo CDK synth failed with errors. Please fix them before deploying.
    exit /b %ERRORLEVEL%
)

echo CDK synth completed successfully. Proceeding with deployment...
cdk deploy --require-approval never

endlocal