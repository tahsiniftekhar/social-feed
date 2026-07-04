import { failure, success } from '@/lib/api-response';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import { RegisterSchema } from '@/lib/validators';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return failure(parsed.error.issues[0].message, 400);
    }

    const { firstName, lastName, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return failure('Email already exists', 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });

    return success(user, 201);
  } catch (error) {
    console.error(error);

    return failure('Something went wrong', 500);
  }
}
