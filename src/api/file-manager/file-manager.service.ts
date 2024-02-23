import { Inject, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import { Readable } from 'stream';
import { fileManager } from './entities/file-manager.entity';
import { returnError } from 'src/common/succes-handler/response-handler';
import { PutObjectOutput } from 'aws-sdk/clients/s3';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

@Injectable()
export class FileManagerService {
    private readonly s3: AWS.S3;
    private readonly bucketName: string;
    private readonly http: HttpService;

    constructor(@Inject('FILEMANAGER') private fileRepo: typeof fileManager) {
        this.bucketName = 'rocketship-media';
        this.s3 = new AWS.S3({
            accessKeyId: process.env.DIGITALOCEAN_ACCESS_KEY,
            secretAccessKey: process.env.DIGITALOCEAN_ACCESS_SECRET_KEY,
            endpoint: process.env.BUCKET_URL,
            s3ForcePathStyle: true,
        });
    }

    async fileManagers(id: string) {
        try {
            const allFiles = await this.fileRepo.findAll({
                raw: true,
                order: [['name', 'ASC']],
                where: {  parentId: id },
            });
            // const tree = this.buildTree(allFiles);
            // return tree;
            return allFiles;
        } catch (error) {
            console.log(error.message, 'error');
            return returnError(true, error.message);
        }
    }

    async buildTree(files) {
        const tree = [];

        // Map to store references to nodes by their ID
        const nodeMap = {};

        // Create a node for each file and store it in the node map
        files.forEach((file) => {
            const node = { ...file, children: [] };
            nodeMap[file.id] = node;
        });

        // Connect child nodes to their parent nodes
        files.forEach((file) => {
            const parentId = file.parentId;
            if (parentId) {
                const parentNode = nodeMap[parentId];
                if (parentNode) {
                    parentNode.children.push(nodeMap[file.id]);
                } else {
                    // Handle orphaned child nodes if needed
                }
            } else {
                // If a file has no parent, it's a root node
                tree.push(nodeMap[file.id]);
            }
        });

        return tree;
    }

    async favoriteFiles(rocketShipId: string) {
        try {
            const allFiles = await this.fileRepo.findAll({
                raw: true,
                order: [['name', 'ASC']],
                where: { isFavorite: 'true', rocketShipId: rocketShipId },
            });
            return allFiles;
        } catch (error) {
            console.log(error.message, 'error');
            return returnError(true, error.message);
        }
    }

    /* async fileManagers() {
          try {
              const response: any = await this.fileRepo.findAll({
                  attributes: ["*"],
                  order: [
                      ["name", "ASC"],
                  ],
              });
              const count = await this.fileRepo.count();
              const data = {
                  rows: response,
                  count,
              };
              return data;
          } catch (error) {
              console.log(error.message, "error");
              return returnError(true, error.message);
          }
      }*/

    async uploadFile(file: any, key: string): Promise<ManagedUpload.SendData> {
        const params: AWS.S3.PutObjectRequest = {
            Bucket: this.bucketName,
            Key: key,
            Body: Readable.from(file.buffer),
        };
        return await this.s3.upload(params).promise();
    }

    async createFolder(
        folderName: string,
        parentFolder?: string,
    ): Promise<{ key: string; putObjectOutput: AWS.S3.PutObjectOutput }> {
        let folderKey = parentFolder;
        // if (parentFolder) {
        //     folderKey = parentFolder + '/' + folderKey;
        // }
        const params: AWS.S3.PutObjectRequest = {
            Bucket: this.bucketName,
            Key: folderKey,
            Body: '',
        };
        const putObjectOutput = await this.s3.putObject(params).promise();
        return { key: folderKey, putObjectOutput };
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

    /* async createFolder(folderName: string): Promise<PutObjectOutput> {
          const params: AWS.S3.PutObjectRequest = {
              Bucket: this.bucketName,
              Key: 'd41d8cd98f00b204e9800998ecf8427e'+folderName + '/',
              Body: '',
          }; 
          return await this.s3.putObject(params).promise();
      }*/

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
            isDeleted: isDeleted,
            isFavorite: isFavorite,
        };
        try {
            console.log('data*****************', data);
            const response: any = await this.fileRepo.create(data);
            return response?.data;
        } catch (err) {
            console.log('err.message', err.message);
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

    async favoriteFolderOrFile(rocketShipId: string, id: string) {
        try {
            let file = await this.fileRepo.findOne({
                where: {
                    id: id,
                    rocketShipId: rocketShipId,
                },
            });
            const updatedIsFavorite = Boolean(!file.isFavorite);
            const response = await this.fileRepo.update(
                {
                    isFavorite: updatedIsFavorite.toString(),
                },
                {
                    where: {
                        id: id,
                        rocketShipId: rocketShipId,
                    },
                },
            );
            if (response[0] === 0) {
                throw returnError(true, 'WRONG_RESULT');
            }
            return response;
        } catch (err) {
            return returnError(true, err.message);
        }
    }

    async checkMediaExist(rocketShipId: string) {
        try {
            const response: any = await this.fileRepo.findAndCountAll({
                where: { rocketShipId: rocketShipId },
            });
            if (response[0] === 0) throw returnError(true, 'WRONG_RESULT');
            return response;
        } catch (err) {
            return returnError(true, err.message);
        }
    }

    async softDelete(id: string) {
        try {
            const response: any = await this.fileRepo.update(
                { isDeleted: true },
                { where: { id: id } },
            );
            if (response[0] === 0) throw returnError(true, 'WRONG_RESULT');
            return response;
        } catch (err) {
            return returnError(true, err.message);
        }
    }

    async delete(id: string) {
        try {
            const response: any = await this.fileRepo.destroy({ where: { id: id } });
            if (response[0] === 0) throw returnError(true, 'WRONG_RESULT');
            return response;
        } catch (err) {
            return returnError(true, err.message);
        }
    }

    async authenticate(token: string) {
        try {
            const baseUrl: string = 'https://admin.flyrocketship.com/authenticate';
            const response = await axios.post(baseUrl, {'token':token});
            return response.data.data;
        } catch (err) {
            return returnError(true, err.message);
        }
    }

    async getRocketships() {
        try {
            const baseUrl: string = 'https://admin.flyrocketship.com/rocketships';
            const response = await axios.get(baseUrl);
            return response.data.data;
        } catch (err) {
            return returnError(true, err.message);
        }
    }
}
