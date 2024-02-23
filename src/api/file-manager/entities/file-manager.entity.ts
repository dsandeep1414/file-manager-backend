import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  ModelCtor,
  Sequelize,
} from 'sequelize-typescript';

enum IsActive {
  true = 'true',
  false = 'false',
}

enum isFavorite {
  true = 'true',
  false = 'false',
}

@Table
export class fileManager extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @Column
  name!: string;

  @Column
  bucketKey!: string;

  @Column
  rocketShipId!: string;

  @Column({
    type: DataType.ENUM,
    values: ['file', 'folder'],
    allowNull: false,
  })
  type!: string;

  @Column({
    type: DataType.ENUM,
    values: [
      'file',
      'folder',
      'audio',
      'document',
      'archive',
      'executable',
      'font',
      'vector',
      'other',
    ],
    allowNull: false,
  })
  fileType!: string;

  @Column
  parentId!: string;
 
  @Column({
    type: DataType.ENUM,
    values: ['SEO', 'Local SEO'],
    defaultValue: "false",
    allowNull: false,
  })
  label!: string;

  @Column
  channel!: string;

  @Column({
    type: DataType.ENUM(...Object.values(IsActive)),
    defaultValue: "false",
    allowNull: true,
  })
  isDeleted!: IsActive;

  @Column({
    type: DataType.ENUM(...Object.values(isFavorite)),
    defaultValue: "false",
    allowNull: true,
  })
  isFavorite!: isFavorite;


  @Default(DataType.NOW)
  @Column({
    allowNull: false,
    field: 'createdAt',
  })
  createdAt!: Date;


  @Default(DataType.NOW)
  @Column({
    allowNull: false,
    field: 'updatedAt',
  })
  updatedAt!: Date;
}
