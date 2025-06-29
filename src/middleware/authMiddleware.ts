import { Request, Response, NextFunction } from "express";
const jwt = require('jsonwebtoken')


const verifyToken = (req: Request, res: Response, next: NextFunction) =>{
    try {
        let token
        if (req.cookies.token){
            token = req.cookies.token
        }else if(req.headers["authorization"]){
            token = req.headers["authorization"]
        }else{
            res.status(401).json({ success: false, message: 'Access denied. No token provided.'});
            return
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        (req as any).user = decoded; 
        next(); 
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid token.' });
    }
}

export {verifyToken}