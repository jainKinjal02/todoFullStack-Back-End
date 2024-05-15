// index.js
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/todos', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define GraphQL schema
const schema = buildSchema(`
  type Todo {
    id: ID!
    text: String!
    completed: Boolean!
  }

  type Query {
    getTodos: [Todo]
  }

  type Mutation {
    addTodo(text: String!): Todo
    toggleTodoCompletion(id: ID!): Todo
    deleteTodo(id: ID!): Boolean
  }
`);

// Mongoose Todo model
const Todo = mongoose.model('Todo', {
  text: String,
  completed: Boolean,
});

// Define GraphQL resolvers
const root = {
  getTodos: async () => {
    return await Todo.find();
  },
  addTodo: async ({ text }) => {
    const todo = new Todo({
      text,
      completed: false,
    });
    await todo.save();
    return todo;
  },
  toggleTodoCompletion: async ({ id }) => {
    const todo = await Todo.findById(id);
    todo.completed = !todo.completed;
    await todo.save();
    return todo;
  },
  deleteTodo: async ({ id }) => {
    await Todo.findByIdAndDelete(id);
    return true;
  },
};

const app = express();

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000/graphql');
});
