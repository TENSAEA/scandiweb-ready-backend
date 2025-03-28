const userTypeDef = `#graphql
  type User {
    _id: ID!
    username: String!
    password: String!
  }

  type Query {
    users: [User]
    authUser: User
    user(userId: ID!): User
  }

  type Mutation {
    signUp(input: SignUpInput!): User
    login(input: LoginInput!): User
    logout: LogoutResponse
  }

 

  input SignUpInput {
    username: String!
    password: String!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  type LogoutResponse {
    message: String!
  }
`;

export default userTypeDef;
