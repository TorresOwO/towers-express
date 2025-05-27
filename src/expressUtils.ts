import express, { Express, NextFunction, Request, Response } from "express";
import router from "./routes";
import { Server as HttpsServer, createServer as createHttps } from "https";
import { Server as HttpServer, createServer as createHttp } from "http";
import { sslFileRoute, TowersExpressStartOptions } from "./types";
import fs from "fs";

export class TowersExpress {

    public app: Express;
    public httpsServer: HttpsServer | undefined;
    public httpServer!: HttpServer;
    private functionsEndpoint: string;
    private port: number;
    private sslPort: number | undefined;
    private sslFiles: sslFileRoute | undefined;

    constructor(functionsEndpoint: string, port: number, allowOrigin: string = '*') {
        this.app = express();
        this.functionsEndpoint = functionsEndpoint.startsWith('/') ? functionsEndpoint : `/${functionsEndpoint}`;
        this.port = port;

        
        this.applyMiddleware(express.json());
        this.applyMiddleware(express.urlencoded({ extended: true }));
        this.applyMiddleware((req: Request, res: Response, next: NextFunction) => {
            res.header('Access-Control-Allow-Origin', allowOrigin);
            res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
            res.header('Access-Control-Allow-Methods', 'GET, POST');
            res.header('Allow', 'GET, POST');
            next();
        });

        this.app.use(this.functionsEndpoint, router);
        console.log('functionsEndpoint: ', this.functionsEndpoint);
    }

    public configureSSL(sslPort: number, sslFiles: sslFileRoute) {
        this.sslPort = sslPort;
        this.sslFiles = sslFiles;
    }

    /**
     * Starts the Express server.
     * @param allowOrigin - The allowed origin for CORS. Default is '*'.
     */
    public start({
        onHttpsStart,
        onHttpStart
    }: TowersExpressStartOptions) {

        this.app.get('*', (req: Request, res: Response) => {
            res.sendStatus(404);
        });

        this.openSSLServer(onHttpsStart);
        this.openHttpServer(onHttpStart);

        console.log(`SERVER_PID=${process.pid}`);
    }

    public applyMiddleware(...args: any[]) {
        this.app.use(...args);
    }

    private openHttpServer = (onStart: TowersExpressStartOptions['onHttpStart']) => {
        this.httpServer = createHttp(this.app);
        if (onStart) {
            onStart(this.httpServer);
        }
        this.httpServer.listen(this.port, () => {
            return console.log(`Express is listening at http://localhost:${this.port}`);
        });
    }

    private openSSLServer = (onStart?: (https: HttpsServer) => void) => {

        if (!this.sslFiles || !this.sslPort) {
            console.error('SSL is not configured, call configureSSL first');
            return;
        }

        try {
            var options = {
                key: fs.readFileSync(this.sslFiles.keyPath),
                cert: fs.readFileSync(this.sslFiles.certPath),
            };
            const serverHttps = createHttps(options, this.app);

            if (onStart) {
                onStart(serverHttps);
            }

            /*const io = new Server(serverHttps, {
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"],
                    allowedHeaders: ["Authorization", "X-API-KEY", "Origin", "X-Requested-With", "Content-Type", "Accept", "Access-Control-Allow-Request-Method"],
                    credentials: false,
                }
            });
    
            SocketUtils.setupSocket(io,);*/

            serverHttps.listen(this.sslPort, () => {
                return console.log(`Express is listening at https://localhost:${this.sslPort}`);
            });
            this.httpsServer = serverHttps;
        } catch (error) {
            console.error("Error reading SSL certificates: ", error);
        }
    }
}