import { z } from "zod";
import { LIMITS } from "./limits";
import { QUESTION_STATUSES } from "./types";

export const questionIdSchema = z.uuid({ error: "Pergunta inválida" });

export const createQuestionSchema = z.object({
  text: z
    .string({ error: "Escreva sua pergunta" })
    .trim()
    .min(LIMITS.textMin, { error: `A pergunta precisa ter pelo menos ${LIMITS.textMin} caracteres` })
    .max(LIMITS.textMax, { error: `A pergunta pode ter no máximo ${LIMITS.textMax} caracteres` }),
  author: z
    .string()
    .trim()
    .max(LIMITS.authorMax, { error: `O nome pode ter no máximo ${LIMITS.authorMax} caracteres` })
    .nullish()
    .transform((v) => (v ? v : null)),
});
export type CreateQuestionInput = z.input<typeof createQuestionSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(QUESTION_STATUSES, { error: "Status inválido" }),
});
export type UpdateStatusInput = z.input<typeof updateStatusSchema>;

export const spotlightSchema = z.object({
  id: questionIdSchema.nullable(),
});
export type SpotlightInput = z.input<typeof spotlightSchema>;
