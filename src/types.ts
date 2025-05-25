import type express from 'express';
import { Response, Request } from 'express';
import { Server } from 'https';
import { Server as HttpServer } from 'http';

export type ExpressMiddleware = Parameters<express.Application['use']>[0];

export type sslFileRoute = {
    keyPath: string;
    certPath: string;
}

export interface RequestT extends Request {
  params: {
    functionName: string;
    [key: string]: string;
  };
}
export type ResponseT = Response<any, Record<string, any>>;

export type BodyProperty = {
    type: 'object' | 'string' | 'number' | 'boolean';
    properties?: Record<string, BodyProperty>;
    required?: string[]
    default?: any;
}

export type TowersFunction = {
    method: (req: RequestT, res: ResponseT, user?: any) => Promise<any>;
    auth: boolean;
    maxFiles?: number;
    bodySchema?: BodyProperty;
    rights?: {
        [key: string]: string[];
    };
}

export type TowersExpressStartOptions = {
    allowOrigin?: string;
    onHttpStart?: (http: HttpServer) => void;
    onHttpsStart?: (https: Server) => void;
}