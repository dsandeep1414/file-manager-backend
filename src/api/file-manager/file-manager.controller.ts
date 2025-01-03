import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Res,
	UploadedFile,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileManagerService } from './file-manager.service';
import {
	errorResponse,
	successResponse,
} from 'src/common/succes-handler/response-handler';
import { log } from 'console';
// import { CreateFileManagerDto } from './dto/create-file-manager.dto';
// import { UpdateFileManagerDto } from './dto/update-file-manager.dto';

@Controller('media')
export class FileManagerController {
	constructor(private readonly fileManagerService: FileManagerService) {
		const bucketName = 'rocketship-media';
	}

	@Get('file-managers')
	async fileManagers() {
		try {
			const fileManagerResponse: any =
				await this.fileManagerService.fileManagers(null);
			return successResponse('file fetched successfully', fileManagerResponse);
		} catch (error) {
			return errorResponse('Failed to list files', 400);
		}
	}

	@Get('favorite/:rocketShipId')
	async favoriteFiles(@Param('rocketShipId') rocketShipId: string) {
		try {
			if (!rocketShipId) {
				return errorResponse('rocketShipId not provided', 400);
			}
			const fileManagerResponse: any =
				await this.fileManagerService.fileManagers(rocketShipId);
			return successResponse('file fetched successfully', fileManagerResponse);
		} catch (error) {
			return errorResponse('Failed to list files', 400);
		}
	}


	@Get('/get/:rocketShipId')
	async mediaFiles(@Param('rocketShipId') rocketShipId: string) {
		try {
			if (!rocketShipId) {
				return errorResponse('rocketShipId not provided', 400);
			}
			const fileManagerResponse: any =
				await this.fileManagerService.getMedia(rocketShipId);
			return successResponse('file fetched successfully', fileManagerResponse);
		} catch (error) {
			return errorResponse('Failed to list files', 400);
		}
	}

	@Post('/get/:rocketShipId')
			async searchMedia(@Body() body: any, @Param('rocketShipId') rocketShipId: string) {
		try {
			const { label, channel, search, sort } = body;
			if (!rocketShipId) {
				return errorResponse('rocketShipId not provided', 400);
			}
			const fileManagerResponse: any =
				await this.fileManagerService.searchMedia(rocketShipId, label, channel, search, sort);
			return successResponse('file fetched successfully', fileManagerResponse);
		} catch (error) {
			return errorResponse('Failed to list files', 400);
		}
	}


	@Get('file-managers/:id')
	async fileChild(@Param('id') id: string) {
		try {
			const fileManagerResponse: any =
				await this.fileManagerService.fileManagers(id);
			return successResponse('file fetched successfully', fileManagerResponse);
		} catch (error) {
			return errorResponse('Failed to list files', 400);
		}
	}

	@Get('files')
	async listFiles() {
		try {
			const fileList = await this.fileManagerService.listFiles();
			return successResponse('file fetched successfully', fileList.Contents);
		} catch (error) {
			return errorResponse('Failed to list files', 400);
		}
	}

	@Post('upload')
	@UseInterceptors(FilesInterceptor('files'))
	async uploadFiles(@UploadedFiles() files: any, @Body() body: any) {
		
		try {
			const { rocketshipId, currentFolderKey } = body;
			let currentFolder = '';
			const containsSlash = currentFolderKey.endsWith("/");
			if (!containsSlash) {
				currentFolder = currentFolderKey + '/';
			} else {
				currentFolder = currentFolderKey;
			}

			if (!files || files.length === 0) {
				return errorResponse('No files uploaded', 400);
			}

			const uploadResults = await Promise.all(
				files.map(async (file) => {
					const key = `${currentFolder}/${file.originalname}`;
					console.log('key', key);
					const result = await this.fileManagerService.uploadFile(file, key);
					return result;
				}),
			);
			console.log('uploadResults', uploadResults);
			return successResponse('Files uploaded successfully', uploadResults);
		} catch (error) {
			return errorResponse('File upload failed', 400);
		}
	}


	@Post('upload-icon')
	@UseInterceptors(FilesInterceptor('file'))
	async uploadIcon(@UploadedFiles() file: any, @Body() body: any) {
		try {
			if (Array.isArray(file)) {
				file = file[0];
			}

			if (!file) {
				return errorResponse('No file icon', 400);
			}
			
			const key = `icons/${file.originalname}`;
			const result = await this.fileManagerService.uploadFile(file, key);
			
			return successResponse('File uploaded successfully', { url: result.Location });
		} catch (error) {
			console.error('Upload error:', error);
			return errorResponse('File upload failed', 400);
		}
	}

	

	@Post('delete')
	async deleteFile(@Body() body: any) {
		try {
			const { key, id } = body;
			await this.fileManagerService.delete(id);
			await this.fileManagerService.deleteFile(key);
			return successResponse('File deleted successfully', {
				success: true,
			});
		} catch (error) {
			return errorResponse('Failed to delete file', 400);
		}
	}

	@Post('file')
	async getFile(@Body('key') key: string) {
		try {
			const fileData = await this.fileManagerService.getFile(key);
			return successResponse('File deleted successfully', fileData.Body);
		} catch (error) {
			return errorResponse('Failed to retrieve file', 400);
		}
	}

	@Post('folders')
	async createFolder(@Body() body: any) {
		try {
			const { currentDirectoryKey, folderName } = body;
			if (!folderName) {
				return errorResponse('Folder name not provided', 400);
			}
			const results = await this.fileManagerService.createFolder(
				folderName,
				currentDirectoryKey,
			);
			return successResponse('Folder created successfully', {
				results,
			});
		} catch (error) {
			return errorResponse('Failed to create folder', 400);
		}
	}

	@Post('favorite')
	async favoriteFolderOrFile(@Body() body: any) {
		try {
			const { id, rocketShipId } = body;
			if (!id) {
				return errorResponse('Key not provided', 400);
			}
			const results = await this.fileManagerService.favoriteFolderOrFile(
				rocketShipId,
				id,
			);
			return successResponse('Folder created successfully', {
				results,
			});
		} catch (error) {
			return errorResponse('Failed to create folder', 400);
		}
	}

	@Post('save')
	async saveData(@Body() data: any) {
		try {
			const {
				name,
				bucketKey,
				rocketShipId,
				type,
				fileType,
				icon,
				parentId,
				label,
				channel,
				isDeleted,
				isFavorite,
			} = data;
			const checkMediaExist: any =
				await this.fileManagerService.checkMediaExist(rocketShipId);
				
			let parentKey: string;
			if (!checkMediaExist?.count) {
				const dataResponse = await this.fileManagerService.saveData(
					name,
					bucketKey,
					rocketShipId,
					icon,
					'folder',
					'folder',
					null,
					label,
					channel,
					'false',
					'false',
				);
				console.log('dataResponse++++++++', dataResponse);
				parentKey = dataResponse?.id;
			} else {
				parentKey = parentId;
			}
			
			const dataResponse = await this.fileManagerService.saveData(
				name,
				bucketKey,
				rocketShipId,
				icon,
				type,
				fileType,
				parentKey,
				label,
				channel,
				isDeleted,
				isFavorite,
			);
			return successResponse('Data saved successfully.', dataResponse);
		} catch (error) {
			return errorResponse('Failed to save data.', 400);
		}
	}

	@Post('rename')
	async renameFolder(@Body() data: any) {
		try {
			const { id, name, icon } = data;
			const dataResponse = await this.fileManagerService.rename(id, name, icon);
			return successResponse(
				'Folder or File renamed successfully',
				dataResponse,
			);
		} catch (error) {
			return errorResponse('Failed to rename', 400);
		}
	}

	@Post('check')
	async check(@Body() data: any) {
		const { rocketShipId } = data;
		const response = await this.fileManagerService.checkMediaExist(
			rocketShipId,
		);
		if (response?.count) {
		}
		console.log('response', response?.count);
	}

	@Post('authenticate')
	async authenticate(@Body() data: any) {
		try {
			const { token } = data;
			if (!token) {
				return errorResponse('token not provided', 400);
			}
			const response = await this.fileManagerService.authenticate(token);
			if (response == null) {
				return errorResponse('Failed to retrieved!', 400);
			}
			return successResponse('User Logged In successfully!', response);
		} catch (error) {
			return errorResponse('Failed to rename', 400);
		}
	}

	@Get('rocketships/list')
	async getRocketships(@Param() data: any) {
		try {
			const response = await this.fileManagerService.getRocketships();
			return successResponse('Rocketships retrieved successfully!', response);
		} catch (error) {
			return errorResponse('Failed to retrieved!', 400);
		}
	}

	@Post('download')
	async downloadFile(@Body() data: any) {
		try {
			const { id } = data;
			const response = await this.fileManagerService.downloadFile(id);
			return successResponse('Rocketships retrieved successfully!', {
				file: response,
			});
		} catch (error) {
			return errorResponse('Failed to retrieved!', 400);
		}
	}
}
