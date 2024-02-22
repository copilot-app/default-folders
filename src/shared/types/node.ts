import { z } from "zod"


export const NodeTypeSchema = z.union([z.literal('file'), z.literal('dir')])

export type NodeType = z.infer<typeof NodeTypeSchema>

export const EntrySchema = z.union([z.instanceof(FileSystemDirectoryEntry), z.instanceof(FileSystemFileEntry)])
export type Entry = z.infer<typeof EntrySchema>


// @ts-expect-error
export const NodeSchema = z.object({
  type: NodeTypeSchema,
  entry: EntrySchema,
  // @ts-expect-error
  children: z.array(NodeSchema),
  mime: z.string(),
  key: z.string()
})

export type Node = z.infer<typeof NodeSchema>


export const SignedNodeSchema = NodeSchema.extend({
  signedUrl: z.string().url().optional()
})

export type SignedNode = z.infer<typeof SignedNodeSchema>




