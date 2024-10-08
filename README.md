# Survey Web Application

This project was created using [full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template).

## Project Setup

### Requirments
* [Docker](https://docs.docker.com/engine/install/)
* [Poetry](https://python-poetry.org/docs/)
* [Node](https://nodejs.org/en/download/package-manager)
* [Python](https://www.python.org/downloads/?ref=blog.latitude.so)

### Environment Variables

Begin by making a copy of the `.env.example` file and renaming it to `.env`.

You'll find two `.env.example` files in our project: one from root and one from frontend directory. Go through these directories and run the following to create a copy of `.env.exmaple` as `.env` file:
```
cp .env.example .env
```

The `env` file contains the configuration variables necessary for the project. You can customize the values of these variables accordingly.

> Hint: For development, you should set both `POSTGRES_USER` and`POSTGRES_PASSWORD` as `postgres`.


### Install Packages

Run the following from backend directory:
```
poetry install
```
Run the following from frontend directory:
```
npm install
```

## Local Development 

### Development Setup

Start by running docker container. Run the following from the project's root directory:
```
docker compose up -d
```

Once the container is up and running, you should have following images running:
```
IMAGE                    NAMES
survey_backend:latest    survey-backend-1
adminer                  survey-adminer-1
schickling/mailcatcher   survey-mailcatcher-1
survey_frontend:latest   survey-frontend-1
postgres:12              survey-db-1
traefik:3.0              survey-proxy-1
```

You can verify by opening up Docker Desktop or running the following in terminal:
```
docker ps
```
> Hint: If you are on Windows and your backend image doesn't run and you see /app/prestart.sh: not found error, you should change your `prestart.sh` to use `LF` line endings.

> Note: You don't actually need all of these images running during development. Only `survey_backend`, `adminer` and `postgres` images are neccesary.

These are URLs hosted by docker container:
* Frontend: http://localhost
* Backend: http://localhost/api/
* Automatic Interactive Docs (Swagger UI): http://localhost/docs
* Interactive Database Manager (Adminer): http://localhost:8080
* Traefik UI: http://localhost:8090

### Frontend Development

Our docker container doesn't support live-update for frontend. So, you should start a local server to see the changes you make by running the following from frontend directory:
```
npm run dev
```

This will start a frontend server on `localhost:5173`. Any changes made to frontend will be visible here.

> Note: Frontend will make all API requests to base url specified as `VITE_API_URL` in frontend's `.env` file.

### Backend Development

When the docker container is up and running, any changes you make to the backend will auto-update.

Open up [Adminer](http://localhost:8080) to see interactive database manager.

Open up [Swagger](http://localhost/docs) to see interactive API.

### VS Code Debugging

To debug frontend, you simply open the **Run and Debug** panel and select **Debug Frontend**.

To debug backend, start by configuring Poetry to create virtual environment within the project folder.

Go to backend directory:
```
cd backend
```

Check installed poetry environment by running
```
poetry env info
```
This will list path to the virtual environment created by Poetry:
```
➜  backend git:(vscode-debug) ✗ poetry env info

Virtualenv
Python:         3.12.5
Implementation: CPython
Path:           /home/ilhanbae/.cache/pypoetry/virtualenvs/app-6zZbMuyK-py3.12
Executable:     /home/ilhanbae/.cache/pypoetry/virtualenvs/app-6zZbMuyK-py3.12/bin/python
Valid:          True

Base
Platform:   linux
OS:         posix
Python:     3.12.5
Path:       /home/linuxbrew/.linuxbrew/Cellar/python@3.12/3.12.5
Executable: /home/linuxbrew/.linuxbrew/Cellar/python@3.12/3.12.5/bin/python3.12
```

Now this virtual environment needs to be removed, because the path to this folder vary from machine and we need debugger to access these virtual environment in more consistent way. 


Remove the virtual env by running:
> Note: If you don't see any path listed under Virtualenv, you can skip this step.
```
poetry env remove app-6zZbMuyK-py3.12
``` 

Configure poetry to create virtual environment within the project folder by running:

```
poetry config virtualenvs.in-project true
```

Re-install python packages using:
```
poetry install
```

This will create `.venv` folder inside backend directory. You can also verify the virtual environment setup with 
```
poetry env info
```

One this setup is complete, open the **Run and Debug** panel in Visual Studio Code and select **Debug Backend**.

You can also run both of these debuggers simultaneously by selecting **Debug Frontend and Backend**.

### Testing
Coming soon..

