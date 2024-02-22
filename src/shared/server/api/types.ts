import { z } from "zod";

export const FileChannelSchema = z.object({
  id: z.string(),
  object: z.literal("fileChannel"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  membershipType: z.string(),
  membershipEntityId: z.string(),
  memberIds: z.array(z.string())
})

export type FileChannel = z.infer<typeof FileChannelSchema>
