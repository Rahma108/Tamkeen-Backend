import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { IAuthReq } from '../interface/auth.interface';


@Injectable()
export class LanguageInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        if (context.getType() === 'http') {
        const req = context.switchToHttp().getRequest<IAuthReq>();

        const headerLang = req.headers['accept-language']
            ?.toString()
            .split(',')[0]
            .split('-')[0];

        req.lang =
            headerLang ??
            req.credentials?.user?.lang ??
            'en';
        }

        return next.handle();
    }
}
