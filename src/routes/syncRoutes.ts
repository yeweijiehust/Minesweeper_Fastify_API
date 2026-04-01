import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

interface EconomyBody {
    coins: number;
    lastCheckIn: number;
    streak: number;
}

interface InventoryBody {
    [key: string]: number;
}

export default async function syncRoutes(app: FastifyInstance) {
    
    // GET Economy
    app.get('/economy', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { userId } = request.user as { userId: string };
        
        const user = await User.findById(userId);
        if (!user) {
            return reply.code(404).send({ error: 'User not found' });
        }
        
        return reply.code(200).send(user.economy);
    });

    // POST Economy
    app.post<{
        Body: EconomyBody
      }>(
        '/economy',
        { preHandler: [authenticate] },
        async (request, reply) => {
          const { userId } = request.user as { userId: string };
          const { coins, lastCheckIn, streak } = request.body;
      
          const user = await User.findById(userId);
          if (!user) {
            return reply.code(404).send({ error: 'User not found' });
          }
      
          user.economy = { coins, lastCheckIn, streak };
          await user.save();
      
          return reply.code(200).send({ success: true });
        }
      );

    // GET Inventory
    app.get('/inventory', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { userId } = request.user as { userId: string };
        
        const user = await User.findById(userId);
        if (!user) {
            return reply.code(404).send({ error: 'User not found' });
        }
        
        // Mongoose automatically serializes Map to a JSON object
        return reply.code(200).send(user.inventory || {});
    });

    // POST Inventory
    app.post<{
        Body: InventoryBody
      }>(
        '/inventory',
        { preHandler: [authenticate] },
        async (request, reply) => {
          const { userId } = request.user as { userId: string };
      
          const user = await User.findById(userId);
          if (!user) {
            return reply.code(404).send({ error: 'User not found' });
          }
      
          user.inventory = request.body as any;
          await user.save();
      
          return reply.code(200).send({ success: true });
        }
      );
}