import { getJSON } from "@/lib/http";

export async function GET() {
  return getJSON("/cloudinary/signature");
}
