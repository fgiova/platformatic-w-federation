import fastify from 'fastify'
import mercuriusFederation from '@mercuriusjs/federation'

const reviews = [
  { id: '1', rating: 5, comment: 'Great article!', postId: '1', authorId: '2' },
  { id: '2', rating: 4, comment: 'Very informative', postId: '1', authorId: '3' },
  { id: '3', rating: 3, comment: 'Could be more detailed', postId: '3', authorId: '1' },
  { id: '4', rating: 5, comment: 'Excellent tips!', postId: '4', authorId: '2' }
]

const schema = `
  type Review @key(fields: "id") {
    id: ID!
    rating: Int!
    comment: String!
    postId: ID!
    post: Post
    authorId: ID!
    author: User
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    reviews: [Review]
  }

  extend type Post @key(fields: "id") {
    id: ID! @external
    reviews: [Review]
  }

  type Query {
    reviews: [Review]
    review(id: ID!): Review
  }
`

const resolvers = {
  Query: {
    reviews: () => reviews,
    review: (_, { id }) => reviews.find(r => r.id === id)
  },
  Review: {
    __resolveReference: (review) => reviews.find(r => r.id === review.id),
    author: (review) => ({ __typename: 'User', id: review.authorId }),
    post: (review) => ({ __typename: 'Post', id: review.postId })
  },
  User: {
    reviews: (user) => reviews.filter(r => r.authorId === user.id)
  },
  Post: {
    reviews: (post) => reviews.filter(r => r.postId === post.id)
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
