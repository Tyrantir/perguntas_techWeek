import { json, readJson, route } from "@/core/http/handler";
import { assertAdmin } from "@/core/identity/admin";
import { questionService } from "@/features/questions/server/service";

export const PATCH = route(async (req: Request, ctx: RouteContext<"/api/questions/[id]">) => {
  assertAdmin(req);
  const { id } = await ctx.params;
  return json(await questionService.setStatus(id, await readJson(req)));
});
