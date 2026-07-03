import { applyDecorators, UseGuards } from "@nestjs/common"
import { AuthenticationGuard, AuthorizationGuard } from "../guard"
import { Role } from "./role.decorator"
import { Token } from "./token.decorator"
import { RoleEnum } from "../enum"
import { TokenTypeEnum } from "../enum/security.enum"

export const Auth = (roles : RoleEnum[] , type : TokenTypeEnum = TokenTypeEnum.access)=>{

    return applyDecorators(
            Token(type) ,
            Role(roles) ,
            UseGuards(AuthenticationGuard , AuthorizationGuard)

    )


}