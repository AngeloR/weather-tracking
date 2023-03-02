import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import { HttpRouter } from './router';

export class HttpServer {
	server: express.Application;
  http: http.Server;
	port: number;
	constructor(port: string | number = '9090') {
		this.port = parseInt(port.toString(), 10);
    this.server = express();
		this.configureMiddleWare();
    this.http = http.createServer(this.server);
	}

	configureMiddleWare() {
		this.server.use(express.json());
		this.server.use(bodyParser.json());
    this.server.use(bodyParser.urlencoded({ extended: true }));
	}

  useRouter(router: HttpRouter) {
    this.server.use(router.prefix, router.router);
  }

	start(fn?: any): void {
		console.info(`Listening on port ${this.port}`);
		this.http.listen(this.port, fn?.bind(this));
	}
}

export let server: HttpServer;

export function createServer(port?: string | number): HttpServer {
  if(!server) {
    server = new HttpServer(port);
  }

  return server;
}
