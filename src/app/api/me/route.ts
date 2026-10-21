import { json, route } from "@/core/http/handler";
import { getVoterId } from "@/core/identity/voter";
import { questionService } from "@/features/questions/server/service";

export const GET = route(async () => {
  return json(await questionService.getMe(await getVoterId()));
});
