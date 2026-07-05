type UploadedImage = {
  secure_url: string;
  public_id: string;
};

export async function uploadImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result.data as UploadedImage;
}
