import z from "zod";

export const getDevTokenQuery = z.object({
  role: z.optional(
    z.union([
      z.literal("viewer"),
      z.literal("broadcaster"),
      z.literal("moderator"),
      z.literal("external"),
    ]),
  ),
});
