import { gql } from "apollo-server-express";

const typeDefs = gql`
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
    createdAt: String!
    updatedAt: String!
    userID: ID!
  }

  type Query {
    todos(userID: ID!): [Todo]
    todo(id: ID!): Todo
  }

  type Mutation {
    createTodo(title: String!, userID: ID!): Todo
    updateTodo(id: ID!, title: String, completed: Boolean): Todo
    deleteTodo(id: ID!): Todo
  }
`;

export default typeDefs;
