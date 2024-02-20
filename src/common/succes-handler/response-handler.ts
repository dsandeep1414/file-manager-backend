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
