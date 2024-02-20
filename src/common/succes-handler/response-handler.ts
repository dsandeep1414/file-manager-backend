export const successResponse = (message: string, data: any) => {
  return {
    error: false,
    message,
    data,
  };
};

export const errorResponse = (message: string, data: any) => {
  return {
    error: true,
    message,
    data,
  };
};

export const returnSuccess = (
  errorBit: boolean,
  msg: any,
  data: any,
  status: any = 200,
) => {
  return { error: errorBit, message: msg, data, status };
};
export const returnError = (errorBit: boolean, msg: any, status: any = 400) => {
  return { error: errorBit, message: msg, status, data: null };
};
