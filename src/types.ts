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
    type: 'object' | 'string' | 'number' | 'boolean' | 'array' | 'file';
    items?: BodyProperty; // For arrays
    properties?: Record<string, BodyProperty>;
    enum?: string[] | number[];
    required?: string[]
    default?: any;
    additionalProperties?: boolean;
    example?: any;
    format?: string; // e.g., 'date-time', 'email', etc.
    description?: string;
}
export type TowersFunction = {
    method: (req: RequestT, res: ResponseT, user?: any) => Promise<any>;
    auth: boolean;
    maxFiles?: number;
    bodySchema?: BodyProperty;
    description?: string;
    tags?: string[];
    rights?: {
        [key: string]: string[];
    };
    responseSchema?: {
        [key: string]: BodyProperty;
    };
}

export type TowersExpressStartOptions = {
    allowOrigin?: string;
    onHttpStart?: (http: HttpServer) => void;
    onHttpsStart?: (https: Server) => void;
}