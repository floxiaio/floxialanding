import { handleLead } from "../../../lib/leads-server.mjs";

export const runtime = "nodejs";
export const maxDuration = 20;

export async function POST(request) {
  return handleLead(request);
}
