export type NodeType = 'file' | 'dir'

export type Entry = FileSystemDirectoryEntry | FileSystemFileEntry

export type Node = {
  type: NodeType
  entry: FileSystemDirectoryEntry | FileSystemFileEntry,
  children: Array<Node>
}

