import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    isVerified: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AuthTokens {
    accessToken: String!
    refreshToken: String!
  }

  type AuthPayload {
    user: User!
    tokens: AuthTokens!
  }

  input SignupInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    signup(input: SignupInput!): String!
    login(input: LoginInput!): AuthPayload!
    refreshToken(refreshToken: String!): AuthTokens!
    logout: String!
  }
`;