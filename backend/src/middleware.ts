import { z, ZodSchema } from 'zod'
import { NextFunction, Response, Request } from 'express';
import { fromError } from 'zod-validation-error';
export function validateRequest(schema: ZodSchema<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
            const result = schema.safeParse(req.body);
            if (result.success) {
                next();
            } else {
                const validationError = fromError(result.error);
                console.log(validationError.message);
                res.status(400).send(validationError.message);
            }
        
    }
}
