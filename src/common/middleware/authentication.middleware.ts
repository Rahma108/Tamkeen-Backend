
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { TokenService } from '../utils/service';
import { TokenTypeEnum } from '../enum/security.enum';

export const PreAuthMiddleware = (req : Request &{tokenType:TokenTypeEnum}, res : Response , next:NextFunction )=>{
        if(!req.headers['authorization']){
            res.status(401).json({message :"Missing Authorization"})
        }

    next()

    }
@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    constructor(private readonly tokenService : TokenService){

    }
async use(req: Request &{tokenType:TokenTypeEnum}, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        throw new Error('Authorization header missing');
    }

    const [key, token] = authHeader.split(' ') || [] ;

    if (key !== 'Bearer' || !token) {
        throw new Error('Invalid Authorization format');
    }

    console.log({ key, token , tokenType:req.tokenType });

    const { user, decoded } = await this.tokenService.decodeToken({ token , tokenType:req.tokenType});

    console.log({ user, decoded });

    next();
}
}
