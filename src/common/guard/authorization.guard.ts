import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RoleEnum } from '../enum';
import { HUserDocument } from '../model';
import { CxtType, IAuthReq, IAuthSocket } from '../interface/auth.interface';
import { RoleName } from '../decorator/role.decorator';
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector : Reflector ){

  }
async canActivate(context: ExecutionContext): Promise<boolean> {
  const roles = this.reflector.getAllAndOverride<RoleEnum[]>(
    RoleName,
    [context.getHandler(), context.getClass()],
  );

  let user!: HUserDocument;

  switch (context.getType<CxtType>()) {
    case 'http':
      user = (context.switchToHttp().getRequest() as IAuthReq)
        .credentials.user;
      break;
      case "graphql":
         user= (GqlExecutionContext.create(context).getContext().req as IAuthReq ).credentials.user ;
         break;
      case 'ws':
      user = (context.switchToWs().getClient() as IAuthSocket)
        .credentials.user;
      break;

  }
  if (!roles) return true;
  if (!user || user.role === undefined) return false;
  return roles.includes(user.role);
}
}

