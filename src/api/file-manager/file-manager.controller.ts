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

// import { CreateFileManagerDto } from './dto/create-file-manager.dto';
// import { UpdateFileManagerDto } from './dto/update-file-manager.dto';

@Controller('media')
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {
    const bucketName = 'rocketship-media';
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
      if (!files || files.length === 0) {
        return errorResponse('No files uploaded', 400);
      }

      console.log('Additional data:', body);

      const uploadResults = await Promise.all(
        files.map(async (file) => {
          const key = `${file.originalname}`;
          const result = await this.fileManagerService.uploadFile(file, key);
          return result;
        }),
      );
      return successResponse('Files uploaded successfully', uploadResults);
    } catch (error) {
      return errorResponse('File upload failed', 400);
    }
  }

  /* @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any) {
      try {
        if (!file) {
          return errorResponse('No file uploaded', 400);
        }
        const key = `${file.originalname}`;
        const result = await this.fileManagerService.uploadFile(file, key);
        return successResponse('file upload successfully', result);
      } catch (error) {
        return errorResponse('File upload failed', 400);
      }
    }*/

  @Post('delete')
  async deleteFile(@Body('key') key: string) {
    try {
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
  async createFolder(@Body('folderName') folderName: string) {
    try {
      if (!folderName) {
        return errorResponse('Folder name not provided', 400);
      }

      await this.fileManagerService.createFolder(folderName);

      return successResponse('Folder created successfully', {
        folderName: folderName,
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
        parentId,
        label,
        channel,
        isDeleted,
        isFavorite,
      } = data;
      const dataResponse = await this.fileManagerService.saveData(
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
      );
      console.log('data', data);
      // return successResponse('Folder created successfully', {folderName:folderName});
    } catch (error) {
      return errorResponse('Failed to create folder', 400);
    }
  }

  @Post('rename')
  async renameFolder(@Body() data: any) {
    try {
      const {
        id,
        name
      } = data;
      const dataResponse = await this.fileManagerService.rename(
        id,
        name
      );
      console.log('data', data);
      // return successResponse('Folder created successfully', {folderName:folderName});
    } catch (error) {
      return errorResponse('Failed to create folder', 400);
    }
  }
}
