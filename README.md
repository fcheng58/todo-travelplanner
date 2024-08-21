# django-todo-react

### Clone the project

```bash
cd ~
mkdir workspace 
git clone git@github.com:ryu2/django-todo-react.git
```

### Python backend setup

Download and install python 3.9 from https://www.python.org/
```bash
install pipenv
pip install pipenv

cd ~/workspace/django-todo-react/todo_backend
pipenv install
pipenv shell
export OPENAI_API_KEY="hello world" #consider saving this to your env 
python manage.py migrate
python manage.py runserver
```

Once setup to run the backend run 
```bash
python manage.py runserver
```

### Node frontend setup
Install node https://nodejs.org/en/download/package-manager

Install npm https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
```bash
cd ~/workspace/django-todo-react/todo_frontend/
npm install 
npm start
```

### Accessing the website locally 

```
cd ~/workspace/django-todo-react/todo_backend
python manage.py runserver
cd ~/workspace/django-todo-react/todo_frontend/
npm start
```
```
Access the website here: http://localhost:3000/
```
