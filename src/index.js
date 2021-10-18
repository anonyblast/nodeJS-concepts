const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;
    const usernameExists = users.find((usernameExists) => usernameExists.username == username);

    if (!usernameExists) {
        return response.status(404).json({ error: "User not found" });
    }

    request.usernameExists = usernameExists;

    return next();
}

app.post('/users', (request, response) => {
    // Aqui vamos submeter o nosso usuário
    const { name, username } = request.body;
    const userAlreadyExists = users.some(
        (users) => users.username == username
    );

    if (userAlreadyExists) {
        return response.status(404).json({ error: "User already exists" });
    }

    users.push({
        id: uuidv4(),
        name,
        username,
        todos: [],
    });

    return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { usernameExists } = request;

    return response.json(usernameExists.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { usernameExists } = request;
    const { title, deadline } = request.body;

    const todo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date(),
    }

    usernameExists.todos.push(todo);

    return response.status(200).json(todo);
});


app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { usernameExists } = request;
    const { title, deadline } = request.body;
    const { id } = request.params;

    const todo = usernameExists.todos.find(todo => todo.id == id)

    if (!todo) {
        return response.status(404).json({ error: "Not found" })
    }

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { usernameExists } = request;
    const { id } = request.params;

    const todo = usernameExists.todos.find(todo => todo.id == id)

    if (!todo) {
        return response.status(404).json({
            error: "Not found"
        })
    }

    todo.done = true;

    return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { usernameExists } = request;
    const { id } = request.params;

    const index = usernameExists.todos.findIndex(todo => todo.id == id)

    if (index == -1) {
        return response.status(404).json({ error: "Not found" })
    }

    usernameExists.todos.splice(index, 1);

    return response.status(204).send()
});

module.exports = app;