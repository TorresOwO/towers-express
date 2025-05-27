// src/expressUtils.ts
import express from "express";

// src/routes.ts
import { Router } from "express";
import multer from "multer";

// src/functionsController.ts
var TowersFunctionsController = class {
  /**
   * 
   * @param func Function to check user rights.
   * This function should return a string with error message if rights are not sufficient, or undefined if rights are sufficient.
   */
  static setCheckRightsFunction(func) {
    this.checkRights = func;
    this.overridedCheckRights = true;
  }
  /**
   * 
   * @param func Function to authenticate user.
   * This function should return a user object or null/undefined if authentication fails.
   */
  static setAuthUserFunction(func) {
    this.authUser = func;
    this.overridedAuthUser = true;
  }
  static registerFunction(name, func) {
    if (this.functions[name]) {
      throw new Error(`Function ${name} is already registered.`);
    }
    this.functions[name] = func;
  }
  static getFunction(name) {
    if (!this.functions[name]) {
      throw new Error(`Function ${name} not found.`);
    }
    return this.functions[name];
  }
  static listFunctions() {
    return Object.keys(this.functions);
  }
  static async callFunction(name, req, res) {
    let func;
    try {
      func = this.getFunction(name);
    } catch (error) {
      console.error(`Error retrieving function ${name}:`, error);
      res.status(404).send({ error: `Function not found: ${name}` });
      return;
    }
    let user;
    if (!this.overridedAuthUser) {
      console.warn(`Using default auth user function for function ${name}. Consider overriding it for custom behavior.`);
    }
    user = await this.authUser(req);
    if (func.auth) {
      if (!user) {
        res.status(401).send({ error: "Unauthorized" });
        return;
      }
      if (func.rights) {
        if (!this.overridedCheckRights) {
          console.warn(`Using default rights check for function ${name}. Consider overriding it for custom behavior.`);
        }
        const checkRightsResult = await this.checkRights(user, func.rights, req);
        if (checkRightsResult) {
          res.status(403).send({ error: checkRightsResult });
          console.warn(`User ${user.id} does not have rights for function ${name}: ${checkRightsResult}`);
          return;
        }
      }
    }
    await func.method(req, res, user);
  }
};
TowersFunctionsController.functions = {};
TowersFunctionsController.overridedCheckRights = false;
TowersFunctionsController.overridedAuthUser = false;
TowersFunctionsController.checkRights = async (user, rights, req) => {
  return void 0;
};
TowersFunctionsController.authUser = async (req) => {
  return void 0;
};

// src/routes.ts
var router = Router();
var upload = multer({ storage: multer.memoryStorage() });
router.post("/:functionName", (req, res, next) => {
  const functionName = req.params.functionName;
  let func;
  try {
    func = TowersFunctionsController.getFunction(functionName);
  } catch (error) {
    return;
  }
  if (func.maxFiles && func.maxFiles > 1) {
    upload.array("files", func.maxFiles)(req, res, next);
  } else {
    upload.single("file")(req, res, next);
  }
}, async (req, res) => {
  TowersFunctionsController.callFunction(req.params.functionName, req, res);
});
router.get("/:functionName", async (req, res) => {
  req.body = req.query;
  TowersFunctionsController.callFunction(req.params.functionName, req, res);
});
var routes_default = router;

// src/expressUtils.ts
import { createServer as createHttps } from "https";
import { createServer as createHttp } from "http";
import fs from "fs";
var TowersExpress = class {
  constructor(functionsEndpoint, port) {
    this.openHttpServer = (onStart) => {
      this.httpServer = createHttp(this.app);
      if (onStart) {
        onStart(this.httpServer);
      }
      this.httpServer.listen(this.port, () => {
        return console.log(`Express is listening at http://localhost:${this.port}`);
      });
    };
    this.openSSLServer = (onStart) => {
      if (!this.sslFiles || !this.sslPort) {
        console.error("SSL is not configured, call configureSSL first");
        return;
      }
      try {
        var options = {
          key: fs.readFileSync(this.sslFiles.keyPath),
          cert: fs.readFileSync(this.sslFiles.certPath)
        };
        const serverHttps = createHttps(options, this.app);
        if (onStart) {
          onStart(serverHttps);
        }
        serverHttps.listen(this.sslPort, () => {
          return console.log(`Express is listening at https://localhost:${this.sslPort}`);
        });
        this.httpsServer = serverHttps;
      } catch (error) {
        console.error("Error reading SSL certificates: ", error);
      }
    };
    this.app = express();
    this.functionsEndpoint = functionsEndpoint.startsWith("/") ? functionsEndpoint : `/${functionsEndpoint}`;
    this.port = port;
    this.app.use(this.functionsEndpoint, routes_default);
    console.log("functionsEndpoint: ", this.functionsEndpoint);
  }
  configureSSL(sslPort, sslFiles) {
    this.sslPort = sslPort;
    this.sslFiles = sslFiles;
  }
  /**
   * Starts the Express server.
   * @param allowOrigin - The allowed origin for CORS. Default is '*'.
   */
  start({
    allowOrigin = "*",
    onHttpsStart,
    onHttpStart
  }) {
    this.applyMiddleware(express.json());
    this.applyMiddleware(express.urlencoded({ extended: true }));
    this.applyMiddleware((req, res, next) => {
      res.header("Access-Control-Allow-Origin", allowOrigin);
      res.header("Access-Control-Allow-Headers", "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method");
      res.header("Access-Control-Allow-Methods", "GET, POST");
      res.header("Allow", "GET, POST");
      next();
    });
    this.app.get("*", (req, res) => {
      res.sendStatus(404);
    });
    this.openSSLServer(onHttpsStart);
    this.openHttpServer(onHttpStart);
    console.log(`SERVER_PID=${process.pid}`);
  }
  applyMiddleware(...args) {
    this.app.use(...args);
  }
};
export {
  TowersExpress,
  TowersFunctionsController
};
