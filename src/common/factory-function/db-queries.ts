import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { where } from 'sequelize/types';
import { RECORD_NOT_FOUND } from '../../constants/message.constant';
import { isEmpty } from '../helper/helper';

export const createDoc = async (module: any, createData: any): Promise<any> => {
  const createDoc = module.create(createData);
  return createDoc;
};

export const bulkCreate = async (
  module: any,
  createData: any,
): Promise<any> => {
  const createDocs = module.bulkCreate(createData);
  return createDocs;
};

export const getDoc = async (module: any, docId?: any): Promise<any> => {
  let getDoc;
  let getDocCount;
  if (docId) getDoc = await module.findOne({ where: { id: docId } });
  if (isEmpty(getDoc)) {
    if (isEmpty(getDoc)) {
      return getDoc;
    }
  }
  if (!getDoc) [getDoc, getDocCount] = await module.findAndCount();
  return { data: getDoc, count: getDocCount };
};

export const deleteDoc = async (module: any, createData: any): Promise<any> => {
  const deleteDoc = await module.create(createData);
  return deleteDoc;
};

export const hashDoc = async (doc: string): Promise<string> => {
  const saltOrRounds = 10;
  const hashPassword = await bcrypt.hash(doc, saltOrRounds);
  return hashPassword;
};

export const decryptDoc = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  const decryptPassword = await bcrypt.compare(password, hashPassword);
  return decryptPassword;
};

export const findDocByElementName = async (
  module: any,
  id: number,
  fieldName: any,
) => {
  const whereClouse = { fieldName: id };
  const doc = module.findAll({ where: whereClouse });
  if (!doc) throw new NotFoundException(RECORD_NOT_FOUND);
  return doc;
};
