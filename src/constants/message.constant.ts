export const httpStatusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
};
export const CONNECTION_NOT_FOUND =
  'Connection provider not found in application context';
export const TIMEOUT_EXCEEDED = (timeout: number) =>
  `timeout of ${timeout.toString()}ms exceeded`;
export const STORAGE_EXCEEDED = (keyword: string) =>
  `Used ${keyword} exceeded the set threshold`;
export const UNHEALTHY_RESPONSE_CODE = (responseCode: string | number) =>
  `The service returned an unhealthy response code: ${responseCode}`;

// NFT Messages create here
export const USER_CREATED = (title: string): string =>
  `User ${title} created successfully.`;
export const USER_NOT_CREATED = 'User not create Please try again.';
export const USER_NOT_FOUND = 'User record not found.';
export const RECORD_NOT_FOUND = 'Record not found.';
export const NOT_FOUND = (id: number): string => `User  ${id}  not found.`;
export const USER_FOUND = (records: number): string =>
  `User  ${records}  records found successfully.`;
export const USER_UPDATED = (id: number): string =>
  `User  ${id}  updated successfully.`;
export const USER_DELETED = (records: number): string =>
  `User  ${records}  deleted successfully.`;
