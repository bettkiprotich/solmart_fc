import { put, del } from "@vercel/blob";
import { randomUUID } from "node:crypto";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const allowedImages: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const allowedVideos: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

async function bytes(file: File, count = 32) {
  return new Uint8Array(await file.slice(0, count).arrayBuffer());
}

function startsWith(data: Uint8Array, signature: number[]) {
  return signature.every((value, index) => data[index] === value);
}

function isValidImageSignature(type: string, data: Uint8Array) {
  if (type === "image/jpeg") return startsWith(data, [0xff, 0xd8, 0xff]);
  if (type === "image/png") return startsWith(data, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (type === "image/gif") return new TextDecoder().decode(data.slice(0, 6)) === "GIF87a" || new TextDecoder().decode(data.slice(0, 6)) === "GIF89a";
  if (type === "image/webp") return new TextDecoder().decode(data.slice(0, 4)) === "RIFF" && new TextDecoder().decode(data.slice(8, 12)) === "WEBP";
  return false;
}

function isValidVideoSignature(type: string, data: Uint8Array) {
  if (type === "video/webm") return startsWith(data, [0x1a, 0x45, 0xdf, 0xa3]);
  if (type === "video/mp4") {
    if (data.length < 12) return false;
    return new TextDecoder().decode(data.slice(4, 8)) === "ftyp";
  }
  return false;
}

async function writeValidated(file: File, folder: string, extension: string) {
  const filename = `${folder}/${randomUUID()}.${extension}`;
  const blob = await put(filename, file, { access: "public" });
  return blob.url;
}

export async function saveImageUpload(file: File, folder: "players" | "products" | "galleries" | "teams") {
  if (!file || !allowedImages[file.type]) throw new Error("Only JPG, PNG, WEBP or GIF images are allowed.");
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) throw new Error("Image must be between 1 byte and 8 MB.");
  if (!isValidImageSignature(file.type, await bytes(file))) throw new Error("The uploaded image content does not match its file type.");
  return writeValidated(file, folder, allowedImages[file.type]);
}

export async function saveVideoUpload(file: File) {
  if (!file || !allowedVideos[file.type]) throw new Error("Only MP4 or WEBM videos are allowed.");
  if (file.size <= 0 || file.size > MAX_VIDEO_BYTES) throw new Error("Video must be between 1 byte and 100 MB.");
  if (!isValidVideoSignature(file.type, await bytes(file))) throw new Error("The uploaded video content does not match its file type.");
  return writeValidated(file, "videos", allowedVideos[file.type]);
}

export async function removeUploadedFile(url: string) {
  if (!url.includes("public.blob.vercel-storage.com")) return;
  try { await del(url); } catch (e) { console.error("Error deleting blob:", e); }
}
