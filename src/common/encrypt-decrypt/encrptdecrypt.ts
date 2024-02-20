import jwt from 'jwt-simple';

const secret = process.env.ENCRYPTION_SECRET;

// encoding
export function encrypt(payload: any): string {
  const token: string = jwt.encode(payload, secret);
  return token;
}

// decoding
export function decrypt(token: string): any {
  const payload: any = jwt.decode(token, secret);
  return payload;
}
