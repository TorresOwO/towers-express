import express, { Request, Response, Express } from 'express';
import { Server as Server$1 } from 'https';
import { Server } from 'http';

type ExpressMiddleware = Parameters<express.Application['use']>[0];
type sslFileRoute = {
    keyPath: string;
    certPath: string;
};
interface RequestT extends Request {
    params: {
        functionName: string;
        [key: string]: string;
    };
}
type ResponseT = Response<any, Record<string, any>>;
type BodyProperty = {
    type: 'object' | 'string' | 'number' | 'boolean' | 'array' | 'file';
    items?: BodyProperty;
    properties?: Record<string, BodyProperty>;
    enum?: string[] | number[];
    required?: string[];
    default?: any;
    additionalProperties?: boolean;
    example?: any;
    format?: string;
    description?: string;
};
type TowersFunction = {
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
};
type TowersExpressStartOptions = {
    allowOrigin?: string;
    onHttpStart?: (http: Server) => void;
    onHttpsStart?: (https: Server$1) => void;
};

declare class TowersExpress {
    app: Express;
    httpsServer: Server$1 | undefined;
    httpServer: Server;
    private functionsEndpoint;
    private port;
    private sslPort;
    private sslFiles;
    constructor(functionsEndpoint: string, port: number);
    configureSSL(sslPort: number, sslFiles: sslFileRoute): void;
    /**
     * Starts the Express server.
     * @param allowOrigin - The allowed origin for CORS. Default is '*'.
     */
    start({ allowOrigin, onHttpsStart, onHttpStart }: TowersExpressStartOptions): void;
    applyMiddleware(...args: any[]): void;
    private openHttpServer;
    private openSSLServer;
}

declare class TowersFunctionsController {
    private static functions;
    private static overridedCheckRights;
    private static overridedAuthUser;
    private static checkRights;
    private static authUser;
    /**
     *
     * @param func Function to check user rights.
     * This function should return a string with error message if rights are not sufficient, or undefined if rights are sufficient.
     */
    static setCheckRightsFunction(func: (user: any, rights: TowersFunction['rights'], req: RequestT) => Promise<string | undefined>): void;
    /**
     *
     * @param func Function to authenticate user.
     * This function should return a user object or null/undefined if authentication fails.
     */
    static setAuthUserFunction(func: (req: RequestT) => Promise<any>): void;
    static registerFunction(name: string, func: TowersFunction): void;
    static getFunction(name: string): TowersFunction;
    static listFunctions(): string[];
    static callFunction(name: string, req: RequestT, res: ResponseT): Promise<any>;
}

export { type BodyProperty, type ExpressMiddleware, type RequestT, type ResponseT, TowersExpress, type TowersExpressStartOptions, type TowersFunction, TowersFunctionsController, type sslFileRoute };
