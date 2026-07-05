import { NextRequest } from "next/server";

import { success, failure } from "@/lib/api-response";
import { uploadToCloudinary } from "@/lib/upload";
import { getCurrentUser } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return failure("Unauthorized", 401);
    }

    const formData = await req.formData();

    const file = formData.get("image");

    if (!(file instanceof File)) {
      return failure("Image is required", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return failure("Unsupported image type", 400);
    }

    if (file.size > MAX_SIZE) {
      return failure("Maximum image size is 5MB", 400);
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const uploaded = await uploadToCloudinary(buffer);

    return success(uploaded, 201);
  } catch (error) {
    console.error(error);

    return failure("Upload failed", 500);
  }
}
