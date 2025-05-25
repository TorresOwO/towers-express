import { Router } from "express";
import multer from "multer";
import { RequestT, TowersFunction } from "./types";
import { TowersFunctionsController } from "./functionsController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Support both single 'file' and multiple 'files' uploads
router.post('/:functionName', (req, res, next) => {
    const functionName = req.params.functionName;
    let func: TowersFunction;
    try {
        func = TowersFunctionsController.getFunction(functionName);
    } catch (error) {
        return;
    }

    // Use different upload handlers based on the function
    if (func.maxFiles && func.maxFiles > 1) {
        // For server file uploads, handle multiple files
        upload.array('files', func.maxFiles)(req, res, next);
    } else {
        // For other functions, keep using single file upload
        upload.single('file')(req, res, next);
    }
}, async (req: RequestT, res) => {
    TowersFunctionsController.callFunction(req.params.functionName, req, res)
});

router.get('/:functionName', async (req: RequestT, res) => {
    req.body = req.query;
    TowersFunctionsController.callFunction(req.params.functionName, req, res)
});

export default router;