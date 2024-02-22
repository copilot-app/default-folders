import { z } from "zod";

export const SignedUrlRequestEntrySchema = z.object({
  key: z.string(),
  mime: z.string(),
});
export type SignedUrlRequestEntry = z.infer<typeof SignedUrlRequestEntrySchema>;

export const SignedUrlRequestBodySchema = z.array(SignedUrlRequestEntrySchema);
export type SignedUrlRequestBody = z.infer<typeof SignedUrlRequestBodySchema>;
