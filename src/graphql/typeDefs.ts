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

  type AuthResponse {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  type SignupResponse {
    success: Boolean!
    message: String!
  }

  type VerifyEmailResponse {
    success: Boolean!
    message: String!
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
    signup(input: SignupInput!): SignupResponse!
    login(input: LoginInput!): AuthResponse!
    verifyEmail(token: String!): VerifyEmailResponse!
    refreshToken(refreshToken: String!): AuthResponse!
    logout(refreshToken: String!): Boolean!
  }
`;