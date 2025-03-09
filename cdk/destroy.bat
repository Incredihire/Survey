@echo off

:: Load environment variables
call load-env.bat

:: Run CDK destroy
echo Running CDK destroy...
cdk destroy SurveyStack
endlocal