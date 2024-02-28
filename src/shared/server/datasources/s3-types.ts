import { z } from "zod";


export const S3ObjectSchema = z.object({
  Key: z.string(),
  LastModified: z.string(),
  ETag: z.string(),
  Size: z.number(),
  StorageClass: z.string()
})

export type S3Object = z.infer<typeof S3ObjectSchema>
