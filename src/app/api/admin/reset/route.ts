import { json, route } from "@/core/http/handler";
import { assertAdmin } from "@/core/identity/admin";
import { questionService } from "@/features/questions/server/service";

export const POST = route(async (req: Request) => {
  assertAdmin(req);
  return json(await questionService.reset());
});
