import { RequestT, ResponseT, TowersFunction } from "./types";

export class TowersFunctionsController {
    private static functions: Record<string, TowersFunction> = {};

    private static overridedCheckRights = false;
    private static overridedAuthUser = false;

    private static checkRights = async (user: any, rights: TowersFunction['rights'], req: RequestT): Promise<string | undefined> => {
        return undefined;
    }

    private static authUser = async (req: RequestT): Promise<any> => {
        return undefined; // Default implementation, should be overridden
    }

    /**
     * 
     * @param func Function to check user rights.
     * This function should return a string with error message if rights are not sufficient, or undefined if rights are sufficient.
     */
    public static setCheckRightsFunction(func: (user: any, rights: TowersFunction['rights'], req: RequestT) => Promise<string | undefined>) {
        this.checkRights = func;
        this.overridedCheckRights = true;
    }

    /**
     * 
     * @param func Function to authenticate user.
     * This function should return a user object or null/undefined if authentication fails.
     */
    public static setAuthUserFunction(func: (req: RequestT) => Promise<any>) {
        this.authUser = func;
        this.overridedAuthUser = true;
    }

    public static registerFunction(name: string, func: TowersFunction) {
        if (this.functions[name]) {
            throw new Error(`Function ${name} is already registered.`);
        }
        this.functions[name] = func;
    }

    public static getFunction(name: string): TowersFunction {
        if (!this.functions[name]) {
            throw new Error(`Function ${name} not found.`);
        }
        return this.functions[name];
    }

    public static listFunctions(): string[] {
        return Object.keys(this.functions);
    }
    
    public static async callFunction(name: string, req: RequestT, res: ResponseT): Promise<any> {
        let func: TowersFunction;
        try {
            func = this.getFunction(name);
        } catch (error) {
            console.error(`Error retrieving function ${name}:`, error);
            res.status(404).send({error: `Function not found: ${name}`});
            return;
        }

        let user: any; 
        if (!this.overridedAuthUser) {
            console.warn(`Using default auth user function for function ${name}. Consider overriding it for custom behavior.`);
        }
        user = await this.authUser(req);
        
        if (func.auth) {
            if (!user) {
                res.status(401).send({error: 'Unauthorized'});
                return;
            }

            if (func.rights) {
                if (!this.overridedCheckRights) {
                    console.warn(`Using default rights check for function ${name}. Consider overriding it for custom behavior.`);
                }
                const checkRightsResult = await this.checkRights(user, func.rights, req);
                if (checkRightsResult) {
                    res.status(403).send({error: checkRightsResult});
                    console.warn(`User ${user.id} does not have rights for function ${name}: ${checkRightsResult}`);
                    return;
                }
            }

        } 

        await func.method(req, res, user);
    }
    
}