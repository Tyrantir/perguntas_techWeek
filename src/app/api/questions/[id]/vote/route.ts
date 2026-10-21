import { json, route } from "@/core/http/handler";
import { ensureVoterId } from "@/core/identity/voter";
import { questionService } from "@/features/questions/server/service";

export const POST = route(async (_req: Request, ctx: RouteContext<"/api/questions/[id]/vote">) => {
  const { id } = await ctx.params;
  const voterId = await ensureVoterId();
  return json(await questionService.toggleVote(voterId, id));
});
