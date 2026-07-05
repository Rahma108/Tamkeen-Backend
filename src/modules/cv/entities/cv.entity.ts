
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

import { CVStatusEnum } from "src/common/enum/cv.enum";
import { ICv } from "src/common/interface";

export class Cv {}
registerEnumType(CVStatusEnum , {name :"CVStatusEnum"} )


@ObjectType()
// Response 
export class UploadUrlEntity {
    uploadUrl!: string;
    key!: string;
}
export class OneUserResponse implements Partial<ICv> {

    originalName!: string ;

}