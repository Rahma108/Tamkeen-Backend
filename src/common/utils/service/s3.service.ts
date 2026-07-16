
import { CompleteMultipartUploadCommandOutput, DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, DeleteObjectsCommandOutput, GetObjectCommand, GetObjectCommandOutput, HeadObjectCommand, ListObjectsV2Command, ListObjectsV2CommandOutput, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { createReadStream } from 'node:fs';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StorageApproachEnum, UploadApproachEnum } from "../../enum/multer.enum";
import { extname } from "node:path";

@Injectable()
export class S3Service {
    private client : S3Client ;
    private APPLICATION_NAME : string ; 
    private AWS_ACCESS_KEY_ID: string ; 
    private AWS_BUCKET_NAME: string ; 
    private AWS_EXPIRES_IN: number; 
    private AWS_REGIONS: string ; 
    private AWS_SECRET_ACCESS_KEY : string ; 
    constructor(private readonly configService:ConfigService ){
    this.APPLICATION_NAME = this.configService.get<string>('APPLICATION_NAME') as string
    this.AWS_ACCESS_KEY_ID = this.configService.get<string>('AWS_ACCESS_KEY_ID') as string
    this.AWS_BUCKET_NAME = this.configService.get<string>('AWS_BUCKET_NAME') as string
    this.AWS_EXPIRES_IN= Number(this.configService.get<string>('AWS_EXPIRES_IN') )
    this.AWS_REGIONS = this.configService.get<string>('AWS_REGIONS') as string
    this.AWS_SECRET_ACCESS_KEY = this.configService.get<string>('AWS_SECRET_ACCESS_KEY') as string

        this.client = new S3Client({
            region:this.AWS_REGIONS ,
            credentials :{
                accessKeyId :this.AWS_ACCESS_KEY_ID,
                secretAccessKey:this.AWS_SECRET_ACCESS_KEY
            }

        })
    }
    async uploadAsset({
        storageApproach= StorageApproachEnum.MEMORY,
        Bucket = this.AWS_BUCKET_NAME     ,
        path ="general" ,
        file ,
        ACL = ObjectCannedACL.private ,
        ContentType 
    }:{
        storageApproach?:StorageApproachEnum,
        Bucket?:string  ,
        path?:string ,
        file:Express.Multer.File,
        ACL?:ObjectCannedACL ,
        ContentType?:string | undefined
    }){
        const command = new PutObjectCommand({
            Bucket ,
            Key: `${this.APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}` ,
            ACL ,
            Body : storageApproach === StorageApproachEnum.MEMORY? file.buffer : createReadStream(file.path),
            ContentType :file.mimetype || ContentType

        })
        if(!command.input?.Key){
            throw new BadRequestException("Fail to Upload this asset")

        }
        await this.client.send(command)
        return command.input.Key as string;
    }

    async uploadLargeAsset({
        storageApproach= StorageApproachEnum.DISK,
        Bucket = this.AWS_BUCKET_NAME     ,
        path ="general" ,
        file ,
        ACL = ObjectCannedACL.private ,
        ContentType  ,
        partSize = 5
    }:{
        storageApproach?:StorageApproachEnum,
        Bucket?:string  ,
        path?:string ,
        file:Express.Multer.File,
        ACL?:ObjectCannedACL ,
        ContentType?:string | undefined,
        partSize?: number
    }): Promise<CompleteMultipartUploadCommandOutput>{
        const uploadFile = new Upload({
            client: this.client ,
            params:{
            Bucket ,
            Key: `${this.APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}` ,
            ACL ,
            Body : storageApproach === StorageApproachEnum.MEMORY? file.buffer : createReadStream(file.path),
            ContentType :file.mimetype || ContentType
            } ,
            partSize : partSize * 1024 * 1024


        })
        uploadFile.on("httpUploadProgress" , (progress)=>{
            console.log(progress)
            console.log(`File Upload is ${ ((progress.loaded as number  ) / (progress.total as number )) * 100 }%`)

        })
        return await uploadFile.done()
    }


    async uploadAssets({
        storageApproach= StorageApproachEnum.MEMORY,
        uploadApproach= UploadApproachEnum.SMALL,
        Bucket = this.AWS_BUCKET_NAME     ,
        path ="general" ,
        files ,
        ACL = ObjectCannedACL.private ,
        ContentType 
    }:{
        storageApproach?:StorageApproachEnum,
        uploadApproach?: UploadApproachEnum,
        Bucket?:string  ,
        path?:string ,
        files:Express.Multer.File[],
        ACL?:ObjectCannedACL ,
        ContentType?:string | undefined
    }): Promise<string[] | undefined >{
        let urls:string[] = []
        if(uploadApproach === UploadApproachEnum.LARGE){
            const data = await Promise.all(
            files.map((file)=>{
                return this.uploadLargeAsset({
                storageApproach ,
                file ,
                ACL ,
                Bucket ,
                ContentType ,
                path

            })

            })
        )
        urls = data.map(ele => ele.Key as string )
        }else{
            urls = await Promise.all(
            files.map((file)=>{
                return this.uploadAsset({
                storageApproach ,
                file ,
                ACL ,
                Bucket ,
                ContentType ,
                path

            })

            })
        )
        }
        return urls 
    }

    async createPreSignedUploadLink({
            Bucket = this.AWS_BUCKET_NAME,
            Key,
            expiresIn = this.AWS_EXPIRES_IN,
            ContentType,
        }: {
            Bucket?: string;
            Key: string;
            expiresIn?: number;
            ContentType?: string;
        }): Promise<{ url: string; Key: string }> {

            const command = new PutObjectCommand({
                Bucket,
                Key,
                ContentType,
            });

            const url = await getSignedUrl(this.client, command, {
                expiresIn,
    });

    return {
        url,
        Key,
    };
}
    
        generateKey({
        folder,
        userId,
        originalName,
        }: {
        folder: string;
        userId?: string;
        originalName: string;
        }): string {
        const extension = extname(originalName);

        return `${this.APPLICATION_NAME}/${folder}${
            userId ? `/${userId}` : ""
        }/${randomUUID()}${extension}`;
        }
        async getAsset({
            Bucket = this.AWS_BUCKET_NAME,
            Key,
        }: {
            Bucket?: string;
            Key: string;
        }): Promise<GetObjectCommandOutput> {

            if (!Key.trim()) {
                throw new BadRequestException("Asset key is required");
            }

            try {
                const command = new GetObjectCommand({
                    Bucket,
                    Key,
                });

                return await this.client.send(command);
            } catch (error) {
                throw new BadRequestException("Failed to get asset");
            }
        }

            async createPreSignedFetchLink({
                Bucket = this.AWS_BUCKET_NAME ,
                Key ,
                expiresIn =this.AWS_EXPIRES_IN,
                fileName ,
                download
            }:{
                Bucket?:string  ,
                Key?:string ,
                expiresIn?:number,
                fileName?:string ,
                download?:string
            }):Promise<string>{
                const command = new GetObjectCommand({
                    Bucket ,
                    Key ,
                    ResponseContentDisposition: download === "true" ?
                    `attachment; filename="${fileName || Key?.split("/").pop()}"` : undefined

                })
                const url = await getSignedUrl(this.client , command , {expiresIn} )
                return  url 
            }


            async deleteAsset({
                Bucket = this.AWS_BUCKET_NAME ,
                Key 
            }:{
                            Bucket?:string  ,
                    Key : string
                }):Promise<DeleteObjectCommandOutput>{
                        const command =  new DeleteObjectCommand({
                            Bucket ,
                            Key 
                            
                        })
                        if(!command.input?.Key){
                                throw new BadRequestException("Fail to Upload this asset")
                            }
                        return await this.client.send(command)

    }


    async deleteAssets({
        Bucket = this.AWS_BUCKET_NAME ,
        Keys
    }:{
        Bucket?:string  ,
        Keys : {Key:string}[]
    }):Promise<DeleteObjectsCommandOutput>{
            const command =  new DeleteObjectsCommand({
                Bucket ,
                Delete:{
                    Objects:Keys ,
                    Quiet:false
                }
                
            })
            console.log({Keys})
            return await this.client.send(command)

    }


    async listFolderDir({
        Bucket = this.AWS_BUCKET_NAME ,
        prefix 
    }:{
        Bucket?:string  ,
        prefix : string 
    }):Promise<ListObjectsV2CommandOutput>{
            const command =  new ListObjectsV2Command({
                Bucket ,
                Prefix:`${this.APPLICATION_NAME}/${prefix}`
                
            })
            console.log("Bucket:", Bucket);
            console.log("Prefix:", `${this.APPLICATION_NAME}/${prefix}`);
            return await this.client.send(command)

    }

        async deleteFolderByPrefix({
                Bucket = this.AWS_BUCKET_NAME,
                prefix,
                }: {
                Bucket?: string;
                prefix: string;
                }) {
                const result = await this.listFolderDir({ Bucket, prefix });

                const keys =
                    result.Contents?.map((item) => ({ Key: item.Key! })) ?? [];


                if (keys.length === 0) {
                    return;
                }

                await this.deleteAssets({ Bucket, Keys: keys });
                }

        async exists({
            Bucket = this.AWS_BUCKET_NAME,
            Key,
            }: {
            Bucket?: string;
            Key: string;
            }): Promise<boolean> {
            try {
                const command = new HeadObjectCommand({
                Bucket,
                Key,
                });

                await this.client.send(command);

                return true;
            } catch (error: any) {
                if (
                error?.name === "NotFound" ||
                error?.$metadata?.httpStatusCode === 404
                ) {
                return false;
                }

                throw error;
            }
            }

        }

        