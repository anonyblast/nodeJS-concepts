/**
 * Challenge 01 - NodeJS Concepts
 * 
 * author : anonyblast [Gustavo Iafelix]
 */

const express = require('express');
const cors = require('cors');
const app = express();
const { v4: uuidv4 } = require('uuid');


app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;
    const user = users.find((user) => user.username == username);

    if (!user) {
        return response.status(400).json({ error: "User not found" });
    }

    request.user = user;

    return next();
}

app.post('/users', (request, response) => {
    // Aqui vamos submeter o nosso usuário
    const { name, username } = request.body;
    const user = { id: uuidv4(), name, username, todos: [] };

    const userExists = users.some(
        user => user.username == username
    );

    if (userExists) {
        return response.status(400).json({ error: "User already exists" });
    }

    users.push(user);

    return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { title, deadline } = request.body;

    const todo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date(),
    };

    user.todos.push(todo);

    return response.status(201).json(todo);
});


app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { title, deadline } = request.body;
    const { id } = request.params;

    const todo = user.todos.find(todo => todo.id === id);

    if (!todo) {
        return response.status(404).json({ error: "Todo does not exists." });
    }

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todo = user.todos.find(todo => todo.id === id);

    if (!todo) {
        return response.status(404).json({ error: "Todo does not exists." });
    }

    if (todo.done) {
        return response.status(200).json({ error: "Todo already done" });
    }

    todo.done = true;

    return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todo = user.todos.find(todo => todo.id === id);

    if (!todo) {
        return response.status(404).json({ error: "Todo does not exists." });
    }

    const index = user.todos.indexOf(todo);
    user.todos.splice(index, 1);

    return response.status(204).json();
});

module.exports = app;