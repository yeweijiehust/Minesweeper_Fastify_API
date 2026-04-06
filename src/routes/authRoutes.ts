import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import bcrypt from 'bcrypt';
import User from '../models/User';

const authBodySchema = Type.Object({
  username: Type.String({ minLength: 1 }),
  password: Type.String({ minLength: 1 }),
});

const authSuccessSchema = Type.Object({
  token: Type.String(),
});

const errorSchema = Type.Object({
  error: Type.String(),
});

export default async function authRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<TypeBoxTypeProvider>();

  typedApp.post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Register a new user',
        body: authBodySchema,
        response: {
          200: authSuccessSchema,
          400: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return reply.code(400).send({ error: 'Username already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new User({ username, passwordHash });
      await newUser.save();

      const token = app.jwt.sign({
        userId: newUser._id.toString(),
        username: newUser.username,
      });

      return reply.code(200).send({ token });
    },
  );

  typedApp.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate a user and return a JWT',
        body: authBodySchema,
        response: {
          200: authSuccessSchema,
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;

      const user = await User.findOne({ username });
      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const token = app.jwt.sign({
        userId: user._id.toString(),
        username: user.username,
      });

      return reply.code(200).send({ token });
    },
  );
}
