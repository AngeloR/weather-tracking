import { Router } from 'express';
import { TObject } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { isString } from 'lodash';
import type { Request, Response } from 'express';

type Schema = {
  input?: TObject<any>,
  output?: TObject<any>
};

export type HttpHandler<I, O> = (params: I, rawReq: Request, rawRes: Response) => Promise<O>;

class InvalidUserInputError extends Error {
  statusCode: number;
  constructor(msg: string) {
    super(msg);
    this.statusCode = 400;
  }
}

export class HttpRouter {
  router: Router;
  prefix: string;
  constructor(prefix: string = '') {
    this.router = Router();
    this.prefix = prefix;
  }

	wrap<I, O>(schema: Schema, handler: HttpHandler<I, O>) {
		return async function (req: Request, res: Response) {
			try {
				const start = Date.now();
				console.info(`Req: ${req.method.toUpperCase()} ${req.originalUrl}`);

        const rawParams = {
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers
        };

        if(schema.input) {
          const validator = TypeCompiler.Compile(schema.input);
          const validatorOutput = validator.Check(rawParams);
          if(validatorOutput) {
            console.log(validatorOutput);
            throw new InvalidUserInputError('Invalid user input');
          }
        }

				const output = await handler(rawParams as I, req, res);
				console.info(`Runtime: ${Date.now() - start}ms`);

				if(output === undefined) {
					res.statusCode = 204;
				}
				else if(isString(output)) {
					res.send(output);
				}
				else {
					res.json(output);
				}
			}
			catch(e) {
				console.error(e);
        res.status(e.statusCode || 500).send({
          error: e.message
        });
			}
			finally {
				res.end();
			}
		}
	}

	get<I, O>(schema: Schema, endpoint: string, handler: HttpHandler<I, O>): void {
		console.debug(`Mapped GET ${this.prefix+endpoint}`);
		this.router.get(endpoint, this.wrap<I, O>(schema, handler));
	}

	post<I, O>(schema: Schema, endpoint: string, handler: HttpHandler<I, O>): void {
		console.debug(`Mapped POST ${this.prefix+endpoint}`);
		this.router.post(endpoint, this.wrap<I, O>(schema, handler));
	}
}
