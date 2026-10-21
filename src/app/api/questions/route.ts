import { json, PUBLIC_POLLING_CACHE, readJson, route } from "@/core/http/handler";
import { ensureVoterId } from "@/core/identity/voter";
import { questionService } from "@/features/questions/server/service";

export const GET = route(async () => {
  return json(await questionService.getBoard(), { cache: PUBLIC_POLLING_CACHE });
});

export const POST = route(async (req: Request) => {
  const body = await readJson(req);
  const voterId = await ensureVoterId();
  return json(await questionService.create(voterId, body), { status: 201 });
});
