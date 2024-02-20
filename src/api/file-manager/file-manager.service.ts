import { Inject, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import { Readable } from 'stream';
import { fileManager } from './entities/file-manager.entity';
import { returnError } from 'src/common/succes-handler/response-handler';

@Injectable()
export class FileManagerService {
  private readonly s3: AWS.S3;
  private readonly bucketName: string;

  constructor(@Inject('FILEMANAGER') private fileRepo: typeof fileManager) {
    this.bucketName = 'rocketship-media';
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
      endpoint: process.env.BUCKET_URL,
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

  async saveData(
    name: string,
    bucketKey: string,
    rocketShipId: string,
    type: string,
    fileType: string,
    parentId: string,
    label: string,
    channel: string,
    isDeleted: string,
    isFavorite: string,
  ) {
    const data = {
      name,
      bucketKey,
      rocketShipId,
      type,
      fileType,
      parentId,
      label,
      channel,
      isDeleted,
      isFavorite,
    };
    try {
      const response: any = await this.fileRepo.create(data);
      return response?.data;
    } catch (err) {
      return returnError(true, err.message);
    }
  }

  async rename(id: string, name: string) {
    try {
      const response = await this.fileRepo.update(
        {
          name: name,
        },
        {
          where: {
            id: id,
          },
        },
      );
      if (response[0] === 0) throw returnError(true, 'WRONG_RESULT');
      return response;
    } catch (err) {
      return returnError(true, err.message);
    }
  }
}
