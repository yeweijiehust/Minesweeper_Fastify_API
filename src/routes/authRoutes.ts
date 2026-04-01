import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import User from '../models/User';

interface AuthBody {
    username: string;
    password: string;
}

export default async function authRoutes(app: FastifyInstance) {

    app.post<{ Body: AuthBody }>('/register', async (request, reply) => {
        const { username, password } = request.body;

        if (!username || !password) {
            return reply.code(400).send({ error: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return reply.code(400).send({ error: 'Username already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ username, passwordHash });
        await newUser.save();

        const token = app.jwt.sign({
            userId: newUser._id.toString(),
            username: newUser.username
        });

        return reply.code(200).send({ token });
    });

    app.post<{ Body: AuthBody }>('/login', async (request, reply) => {
        const { username, password } = request.body;

        if (!username || !password) {
            return reply.code(400).send({ error: 'Username and password are required' });
        }

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
            username: user.username
        });

        return reply.code(200).send({ token });
    });
}