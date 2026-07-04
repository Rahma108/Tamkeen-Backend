// import { Socket } from "socket.io";
import type { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { HUserDocument } from "../model";
import { Socket } from "socket.io";
export interface IAuthReq extends Request {
    credentials:{user: HUserDocument , decoded : JwtPayload}
    lang: string;

}


export interface IAuthSocket extends Socket {
    credentials:{user: HUserDocument , decoded : JwtPayload}

}
export type CxtType = 'http' | 'ws' | 'rpc' | 'graphql';