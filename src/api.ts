import { config as dotenv } from 'dotenv';
import { createServer } from '@lib/server';
import { Routers } from './routes';

dotenv();

const server = createServer(process.env.API_PORT || 8080);

Routers.forEach(router => {
  server.useRouter(router)
});

server.start();

