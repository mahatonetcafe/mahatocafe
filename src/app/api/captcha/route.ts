import { issueCaptcha } from "@/lib/captcha";
import { one, run } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await issueCaptcha({ one, run }), { headers: { "Cache-Control": "no-store" } });
}
