import { NextFunction, Request, Response } from "express";
import { createError } from "./errorMiddleware";
import { ObjectSchema } from "joi";


const validateMiddleware = (schema: ObjectSchema) => {
    return (req:Request, res:Response, next:NextFunction) => {
      console.log(req.body)
      const { error } = schema.validate(req.body);
      if (error) {
        // return res.status(400).json({ error: error.details[0].message });
        return next(createError(400,error.details[0].message))
      }
      next();
    };
};



export default validateMiddleware