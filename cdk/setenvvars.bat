:: Load environment variables from .env file
@echo off
setlocal enabledelayedexpansion

:: Process .env file
for /f "tokens=*" %%a in (..\\.env) do (
    set "line=%%a"
    if not "!line:~0,1!"=="#" (
        if not "!line!"=="" (
            :: Echo the variable for debugging
            echo Processing: !line!

            :: Extract variable name and value and set in parent scope
            for /f "tokens=1,* delims==" %%b in ("!line!") do (
                endlocal
                set "%%b=%%c"
                setlocal enabledelayedexpansion
            )
        )
    )
)

:: Explicitly set AWS environment variables for CDK
endlocal
