import fastify from 'fastify'
import mercuriusFederation from '@mercuriusjs/federation'

const posts = [
  { id: '1', title: 'Introduction to GraphQL', content: 'GraphQL is a query language for APIs...', authorId: '1' },
  { id: '2', title: 'Federation Patterns', content: 'Federation allows composing multiple GraphQL services...', authorId: '1' },
  { id: '3', title: 'Fastify Performance', content: 'Fastify is one of the fastest Node.js frameworks...', authorId: '2' },
  { id: '4', title: 'Node.js Best Practices', content: 'Here are some best practices for Node.js...', authorId: '3' }
]

const schema = `
  type Post @key(fields: "id") {
    id: ID!
    title: String!
    content: String!
    authorId: ID!
    author: User
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    posts: [Post]
  }

  type Query {
    posts: [Post]
    post(id: ID!): Post
  }
`

const resolvers = {
  Query: {
    posts: () => posts,
    post: (_, { id }) => posts.find(p => p.id === id)
  },
  Post: {
    __resolveReference: (post) => posts.find(p => p.id === post.id),
    author: (post) => ({ __typename: 'User', id: post.authorId })
  },
  User: {
    posts: (user) => posts.filter(p => p.authorId === user.id)
  }
}

export async function create () {
  const app = fastify({ logger: true })

  await app.register(mercuriusFederation, {
    schema,
    resolvers,
    graphiql: false,
  })

  await app.ready()
  return app
}
