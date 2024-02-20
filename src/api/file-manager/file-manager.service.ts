import { Injectable } from '@nestjs/common';
// import { CreateFileManagerDto } from './dto/create-file-manager.dto';
// import { UpdateFileManagerDto } from './dto/update-file-manager.dto';
import * as AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import { Readable } from 'stream';

@Injectable()
export class FileManagerService {
    private readonly s3: AWS.S3;
    private readonly bucketName: string;

    constructor() {
        this.bucketName = 'rocketship-media';
        this.s3 = new AWS.S3({
            accessKeyId: 'DO00VVHNNBFEHLHJWQWH',
            secretAccessKey: '8rDJPkD9bcG0O6QmEfVn6fgth8xelo9OqH3IT4ttdn0',
            endpoint: 'https://rocketship-bucket.nyc3.digitaloceanspaces.com',
            s3ForcePathStyle: true,
        });
    }

    async uploadFile(file: any, key: string): Promise<ManagedUpload.SendData> {
        const params: AWS.S3.PutObjectRequest = {
            Bucket: this.bucketName,
            Key: 'logs' + key,
            Body: Readable.from(file.buffer),
        };
        return await this.s3.upload(params).promise();
    }

    async deleteFile(key: string): Promise<void> {
        const params: AWS.S3.DeleteObjectRequest = {
            Bucket: this.bucketName,
            Key: key,
        };
        await this.s3.deleteObject(params).promise();
    }

    async listFiles(): Promise<AWS.S3.ListObjectsV2Output> {
        const params: AWS.S3.ListObjectsV2Request = {
            Bucket: this.bucketName,
        };
        return await this.s3.listObjectsV2(params).promise();
    }

    async getFile(key: string): Promise<AWS.S3.GetObjectOutput> {
        const params: AWS.S3.GetObjectRequest = {
            Bucket: this.bucketName,
            Key: key,
        };
        return await this.s3.getObject(params).promise();
    }

    async createFolder(folderName: string): Promise<void> {
        const params: AWS.S3.PutObjectRequest = {
            Bucket: this.bucketName,
            Key: folderName + '/',
            Body: '',
        };
        await this.s3.putObject(params).promise();
    }


    async saveData(data:any){
        // const params: AWS.S3.GetObjectRequest = {
        //     Bucket: this.bucketName,
        //     Key: key,
        // };
        // return await this.s3.getObject(params).promise();
    }
}
