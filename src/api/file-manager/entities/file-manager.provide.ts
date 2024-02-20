import { fileManager } from './file-manager.entity';

export const FileManagerProviders = [
  {
    provide: 'FILEMANAGER',
    useValue: fileManager,
  },
];
