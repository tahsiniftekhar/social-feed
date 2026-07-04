import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { failure, success } from '@/lib/api-response';
import { AUTH_COOKIE_NAME, authCookieOptions } from '@/lib/cookies';
import { createToken } from '@/lib/jwt';
import { verifyPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import { LoginSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return failure(result.error.issues[0].message, 400);
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return failure('Invalid email or password', 401);
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return failure('Invalid email or password', 401);
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
    });

    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, token, authCookieOptions);

    return success({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error) {
    console.error(error);

    return failure('Something went wrong', 500);
  }
}
