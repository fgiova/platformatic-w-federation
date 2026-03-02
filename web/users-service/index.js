import fastify from 'fastify'
import mercuriusFederation from '@mercuriusjs/federation'

const users = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com' }
]

const schema = `
  type User @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }
`

const resolvers = {
  Query: {
    users: () => users,
    user: (_, { id }) => users.find(u => u.id === id)
  },
  User: {
    __resolveReference: (user) => users.find(u => u.id === user.id)
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
