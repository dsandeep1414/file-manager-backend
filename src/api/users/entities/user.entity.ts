import { validate } from 'class-validator';
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class user extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column
  firstname: string;

  @Column
  lastname: string;

  @Column({
    unique: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    unique: false,
  })
  phonenumber: string;

  @Column
  datebirth: string;

  @Column({
    unique: false,
  })
  username: string;

  @Column
  password: string;

  @Column
  country: string;

  @Column
  state: string;

  @Column
  city: string;

  @Column
  address: string;

  @Column
  postcode: string;

  @Column
  otp: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isactive: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isverified: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isdeleted: boolean;

  @Column({
    type: DataType.ENUM,
    values: [
      'pending',
      'completed',
      'deleted',
      'admin blocked',
      'in admin approval',
      'canceled',
    ],
    defaultValue: 'pending',
  })
  status: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  kyc: boolean;

  @Column({
    type: DataType.ENUM,
    values: ['fundraiser', 'donor'],
    defaultValue: 'donor',
  })
  role: string;

  @Column({
    type: DataType.JSON,
    defaultValue: null,
  })
  extrainfo: any;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  googleAuth: string;

  @Column
  googleAuthSecret: string;

  @Column
  profileImage: string;
}
