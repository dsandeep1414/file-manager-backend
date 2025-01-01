import { Inject, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import { Readable } from 'stream';
import { fileManager } from './entities/file-manager.entity';
import { returnError } from 'src/common/succes-handler/response-handler';
import { PutObjectOutput } from 'aws-sdk/clients/s3';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { Op, Order } from 'sequelize';

@Injectable()
export class FileManagerService {
    private readonly s3: AWS.S3;
    private readonly bucketName: string;
    private readonly http: HttpService;

    constructor(@Inject('FILEMANAGER') private fileRepo: typeof fileManager) {
        this.bucketName = process.env.BUCKET_NAME;
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
            endpoint: process.env.BUCKET_URL,
            s3ForcePathStyle: true,
            signatureVersion: 'v4',
            region: process.env.REGION
        });
    }

    async fileManagers(id: string) {
        try {
            const allFiles = await this.fileRepo.findAll({
                raw: true,
                order: [['name', 'ASC']],
                where: { parentId: id },
            });
            // const tree = this.buildTree(allFiles);
            // return tree;
            return allFiles;
        } catch (error) {
            console.log(error.message, 'error');
            return returnError(true, error.message);
        }
    }

    async getMedia(id: string) {
        try {
            const allFiles = await this.fileRepo.findAll({
                raw: true,
                order: [['name', 'ASC']],
                where: { rocketShipId: id },
            });
            console.log({allFiles});
            
            // const tree = this.buildTree(allFiles);
            // return tree;
            return allFiles;
        } catch (error) {
            console.log(error.message, 'error');
            return returnError(true, error.message);
        }
    }

    async searchMedia(rocketShipId: string, label: string, channel: string, search:string,sort:string) {
        try {
            const whereClause: any = { rocketShipId };
            if (search !== undefined) {
                whereClause.name = { [Op.like]: '%' + search + '%' }; 
            }
            if (label !== undefined && label !== '') {
                whereClause.label = label;
            }
            if (channel !== undefined && channel !== '') {
                whereClause.Channels = channel;
            }
            const order: Order = sort && sort.toLowerCase() === 'asc' ? [['createdAt', 'ASC']] : [['createdAt', 'DESC']];
            const allFiles = await this.fileRepo.findAll({
                raw: true,
                order: order,
                where: whereClause
            });
            if (allFiles.length === 0) {
                return { error: false, message: "No files found", data: [] };
            }

            // const matchingFilesAndAncestors = await Promise.all(allFiles.map(async (file) => {
            //     const ancestors = await this.findAncestorsWithRocketShipId(file.parentId, rocketShipId);
            //     return [file, ...ancestors];
            // }));
            // const tree = await this.buildSearchTree(matchingFilesAndAncestors.flat(), []);
            
            return { error: false, message: "Files fetched successfully", data: allFiles };
        } catch (error) {
            console.log(error.message, 'error');
            return { error: true, message: error.message, status: 500, data: null };
        }
    }
    

    async findAncestorsWithRocketShipId(
        parentId: string,
        targetRocketShipId: string,
    ): Promise<any[]> {
        const ancestors = [];
        let currentId = parentId;
        while (currentId) {
            const parentNode = await this.fileRepo.findOne({
                where: { id: currentId },
            });
            if (parentNode && parentNode.rocketShipId === targetRocketShipId) {
                ancestors.push(parentNode);
            }
            currentId = parentNode?.parentId;
        }
        return ancestors;
    }

    async buildSearchTree(files: any[], matchingFiles: any[]) {
        const tree = [];
        const nodeMap: { [key: string]: any } = {};
        [...files, ...matchingFiles].forEach((file) => {
            const node = { ...file, children: [] };
            nodeMap[file.id] = node;
        });
        Object.values(nodeMap).forEach((node) => {
            const parentId = node.parentId;
            if (parentId) {
                const parentNode = nodeMap[parentId];
                if (parentNode) {
                    parentNode.children.push(node['dataValues']);
                } else {
                }
            } else {
                if (node['dataValues'] == undefined) {
                    tree.push(node);
                } else {
                    tree.push(node['dataValues']);
                }
            }
        });
        return tree;
    }

    async buildTree(files) {
        const tree = [];
        const nodeMap = {};
        files.forEach((file) => {
            const node = { ...file, children: [] };
            nodeMap[file.id] = node;
        });
        files.forEach((file) => {
            const parentId = file.parentId;
            if (parentId) {
                const parentNode = nodeMap[parentId];
                if (parentNode) {
                    parentNode.children.push(nodeMap[file.id]);
                } else {
                }
            } else {
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
        const params = {
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        try {
            return await this.s3.upload(params).promise();
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async createFolder(
        folderName: string,
        parentFolder?: string,
    ): Promise<{ key: string; putObjectOutput: AWS.S3.PutObjectOutput }> {
        let folderKey = parentFolder;
        const containsSlash = folderKey.includes('/');
        if (!containsSlash) {
            folderKey = parentFolder + '/' + folderName + '/';
        } else {
            folderKey = parentFolder + folderName + '/';
        }
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
        icon: string,
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
            icon,
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

    async rename(id: string, name: string, icon?: string) {
        try {
            const updateData = {
                name: name,
                ...(icon ? { icon } : {})
            };

            const response = await this.fileRepo.update(
                updateData,
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
            const response = await axios.post(baseUrl, { token: token });
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

    async getFile(key: string): Promise<AWS.S3.GetObjectOutput> {
        const params: AWS.S3.GetObjectRequest = {
            Bucket: this.bucketName,
            Key: key,
        };
        console.log('params=========', params);
        return await this.s3.getObject(params).promise();
    }

    async getFileURLAndSetReadPermission(key: string): Promise<string> {
        const params: AWS.S3.GetObjectRequest = {
            Bucket: this.bucketName,
            Key: key,
        };
        try {
            const getObjectOutput = await this.s3.getObject(params).promise();
            await this.s3
                .putObjectAcl({
                    Bucket: this.bucketName,
                    Key: key,
                    ACL: 'public-read',
                })
                .promise();
            const fileURL = this.s3.getSignedUrl('getObject', {
                Bucket: this.bucketName,
                Key: key,
                Expires: 3600,
            });
            return fileURL;
        } catch (error) {
            console.error('Error retrieving file or setting permissions:', error);
            throw error;
        }
    }

    async downloadFile(id: any) {
        try {
            let file = await this.fileRepo.findOne({
                where: {
                    id: id,
                },
            });
            const mediaData = await this.getFileURLAndSetReadPermission(
                file.bucketKey,
            );
            return mediaData;
        } catch (err) {
            return returnError(true, err.message);
        }
    }
}
