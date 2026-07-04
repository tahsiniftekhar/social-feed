import { SignJWT, jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined');
}

const secret = new TextEncoder().encode(jwtSecret);

const EXPIRES_IN = '7d';

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export async function createToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (typeof payload.userId !== 'string' || typeof payload.email !== 'string') {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
