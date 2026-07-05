import { z } from 'zod';

/**
 * Register Validation
 */
export const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name is too long'),

    lastName: z
      .string()
      .trim()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name is too long'),

    email: z.email('Please enter a valid email address').trim().toLowerCase(),

    password: z
      .string()
      .min(8, 'Password must contain at least 8 characters')
      .max(100)
      .regex(/[A-Z]/, 'Password must contain one uppercase letter')
      .regex(/[a-z]/, 'Password must contain one lowercase letter')
      .regex(/[0-9]/, 'Password must contain one number'),

    confirmPassword: z.string().min(1, 'Please confirm your password'),

    terms: z.boolean().refine((value) => value, {
      message: 'You must accept the terms and conditions.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Login Validation
 */
export const LoginSchema = z.object({
  email: z.email('Invalid email').trim().toLowerCase(),

  password: z.string().min(1, 'Password is required'),
});

/**
 * Create Post Validation
 */
export const CreatePostSchema = z.object({
  content: z.string().trim().min(1, 'Post content is required').max(5000, 'Post is too long'),

  imageUrl: z.url().optional(),

  imagePublicId: z.string().optional(),

  visibility: z
    .enum(["PUBLIC", "PRIVATE"])
    .default("PUBLIC"),
});

/**
 * Types
 */

export type RegisterInput = z.infer<typeof RegisterSchema>;

export type LoginInput = z.infer<typeof LoginSchema>;

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
