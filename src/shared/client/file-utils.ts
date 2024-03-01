import * as nodeTypes from "../types/node";
import * as domTypes from './types/dom'


const getMime = (signature: string) => {
  // You can add file signatures here to add
  // support for new files:
  switch (signature) {
    case "4D7922054":
      return "text/plain";
    case "89504E47":
      return "image/png";
    case "47494638":
      return "image/gif";
    case "25504446":
      return "application/pdf";
    case "2320636F":
      return "text/markdown";
    case "D0CF11E0":
      return "application/msword";
    case "D0CF11E0A1B11AE1":
      return "application/vnd/ms-excel";
    case "504B030414000600":
      return "application/vnd/openxmlformats-officedocument.spreadsheetml.sheet";
    case "FFD8FFDB":
    case "FFD8FFE0":
    case "FFD8FFE1":
      return "image/jpeg";
    case "504B0304":
      return "application/zip";
    case "504B34":
      return "application/zip";
    default:
      return "Unknown filetype";
  }
};

export async function getFileMimeType(
  entry: FileSystemFileEntry | domTypes.FileEntry
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (entry.isDirectory) {
      resolve("dir");
    }
    entry.file(
      (file) => {
        let reader = new FileReader();

        reader.onload = () => {
          if (reader.result instanceof ArrayBuffer) {
            const uint = new Uint8Array(reader.result);
            let bytes: Array<string> = [];
            uint.forEach((byte) => {
              bytes.push(byte.toString(16));
            });
            const hex = bytes.join("").toUpperCase();
            const mimeType = getMime(hex);
            resolve(mimeType); // Resolve with the MIME type
          }
        };

        reader.onerror = () => {
          if (reader?.error instanceof DOMException) {
            reject(reader.error); // Reject with an error
          }
        };

        reader.readAsArrayBuffer(file.slice(0, 4));
      },
      () => {
        reject(new Error("Unable to read file")); // Reject with an error
      }
    );
  });
}

export async function getFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file(
      (file) => {
        if (file instanceof File) {
          resolve(file);
        }
      },
      () => {
        reject(new Error("Unable to read file"));
      }
    );
  });
}

export function readDirectory(directory: FileSystemDirectoryEntry) {
  return new Promise((resolve, reject) => {
    let dirReader = directory.createReader();

    let getEntries = () => {
      dirReader.readEntries(
        (results) => {
          resolve(results);
        },
        (error) => {
          reject(error); // Reject the promise with the error
        }
      );
    };

    getEntries();
  });
}

async function createNode(
  t: nodeTypes.NodeType,
  entry: nodeTypes.Entry
): Promise<nodeTypes.Node> {
  let mime = "N/A";
  let key = entry.fullPath;
  
  if (entry?.isFile) {
    // @ts-ignore
    mime = await getFileMimeType(entry);
  }

  if (entry.isDirectory) {
    mime = "folder";
  }

  if (key.startsWith("/")) {
    key = key.slice(1);
  }

  return {
    children: [],
    entry: entry,
    type: t,
    mime,
    key,
  };
}

async function getFileStructure(
  root: nodeTypes.Entry
): Promise<nodeTypes.Node> {
  if (root.isFile) {
    return createNode("file", root);
  }

  const rootNode = await createNode("dir", root);

  const collectChildren = async (node: nodeTypes.Node) => {
    if (node.entry.isFile) {
      return;
    }
    const children = await readDirectory(node.entry);

    if (children instanceof Array) {
      for (const child of children) {
        const nt = child.isFile ? "file" : "dir";
        const n = await createNode(nt, child);
        node.children.push(n);
        await collectChildren(n);
      }
    }
  };

  await collectChildren(rootNode);

  return rootNode;
}

export const convertToHierarchyNodes = async (
  entries: Array<nodeTypes.Entry>
) => {
  const result: Array<nodeTypes.Node> = [];
  for (const x of entries) {
    result.push(await getFileStructure(x));
  }
  return result;
};

export const collectFilesFromNodeHierarchy = (nodes: Array<nodeTypes.Node>) => {
  const result: Array<nodeTypes.Node> = [];

  const recurse = (node: nodeTypes.Node) => {
    if (node.entry.isFile) {
      result.push(node);
    } else {
      if (node.children.length === 0) {
        result.push(node);
      } else {
        for (const child of node.children) {
          recurse(child);
        }
      }
    }
  };

  for (const n of nodes) {
    recurse(n);
  }

  return result;
};
