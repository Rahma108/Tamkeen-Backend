
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { HUserDocument } from '../model';
import { CxtType, IAuthReq, IAuthSocket } from '../interface/auth.interface';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
      let user!:HUserDocument;
        switch (context.getType<CxtType>()) {
            case "http":
            user = (context.switchToHttp().getRequest() as IAuthReq).credentials.user
            break;
            case "graphql":
            user= (GqlExecutionContext.create(context).getContext().req as IAuthReq ).credentials.user ;
          break;
          case 'ws':
          user = (context.switchToWs().getClient() as IAuthSocket)
            .credentials.user;
          break;
        
            default:
            break;
        }
        return user
  },
);
