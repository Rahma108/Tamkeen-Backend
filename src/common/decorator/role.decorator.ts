import { SetMetadata } from "@nestjs/common"
import { RoleEnum } from "../enum"

export const RoleName = "Roles"
export const Role = (roles : RoleEnum[] )=>{
    return SetMetadata(RoleName  , roles )
}