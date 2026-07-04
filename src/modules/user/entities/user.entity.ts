export class User {}
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { GenderEnum, LangEnum, ProviderEnum, RoleEnum } from "src/common/enum";
import { IUser } from "src/common/interface";


registerEnumType(GenderEnum , {name :"GenderEnum"} )
registerEnumType(ProviderEnum , {name :"ProviderEnum"} )
registerEnumType( LangEnum, {name :"LangEnum"} )
registerEnumType( RoleEnum , {name :"RoleEnum"} )

@ObjectType()
export class OneUserResponse implements Partial<IUser> {

    @Field(()=> String , {nullable : true })
    DOB?: Date | undefined;
    @Field(()=> String , {nullable :false})
    createdAt!: Date ;
    @Field(()=> String , {nullable : true })
    deletedAt?: Date | undefined;
    @Field(()=> String , {nullable : true })
    updatedAt?: Date | undefined;
    @Field(()=> String , {nullable : true })
    changeCredentialTime?: Date | undefined;
    @Field(()=> String , {nullable : true })
    confirmEmail?:Date | undefined;

    @Field(()=> String , {nullable :false})
    email!:string ;
    @Field(()=> String , {nullable :false})
    firstName!:string ;
    @Field(()=> String , {nullable :false})
    lastName!:string;
    @Field(()=> String , {nullable :false})
    username!: string ;

    @Field(()=> String , {nullable : true })
    password?: string | undefined;

    @Field(()=> GenderEnum)
    gender !: GenderEnum ;
    @Field(()=> ProviderEnum)
    provider!:ProviderEnum;
    @Field(()=> RoleEnum)
    role!:RoleEnum ;
    @Field(()=>LangEnum )
    lang!:LangEnum ;

    @Field(()=> String , {nullable : true })
    profileImage?: string | undefined;
    @Field(()=> [String] , {nullable : true })
    coverImages?: string[] | undefined ;

    restoredAt ?: Date | undefined;
    @Field(()=> String , {nullable : true })
    phone?: string | undefined;





}