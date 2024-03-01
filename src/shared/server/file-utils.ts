import * as s3Types from "./s3/types";

type Node = {
  dir: string;
  path: string;
  fullpath: string;
  children: Array<Node>;
};

const createNode = (fullpath: string): Node => {
  const tokens = fullpath.split("/");
  const dir = tokens.length > 1 ? tokens[tokens.length - 1] : tokens[0];

  const path =
    tokens.length > 1 ? tokens.slice(0, tokens.length - 1).join("/") : "";

  let fp = fullpath;

  if (fp.startsWith("/")) {
    fp = fullpath.slice(1, fullpath.length);
  }

  const node = {
    dir,
    path,
    fullpath: fp,
    children: [],
  };

  return node;
};

const getParentNode = (root: Node, node: Node): null | Node => {
  let result: null | Node = null;

  const parentPath = node.path;

  const getParent = (startNode: Node) => {
    const recurse = (currentNode: Node) => {
      if (!result) {
        if (currentNode.fullpath === parentPath) {
          result = currentNode;
        }
        if (currentNode.children.length > 0) {
          for (const child of currentNode.children) {
            recurse(child);
          }
        }
      }
    };
    recurse(startNode);
  };

  getParent(root);

  return result;
};

const createNodeHierarchy = (node: Node): Node => {
  if (node.fullpath === "") {
    return node;
  }

  const tokens = node.fullpath.split("/").filter((tk) => tk !== "");

  let result: null | Node = null;
  let latestNode: null | Node = null;

  for (let i = 0; i < tokens.length; i++) {
    let node: Node | null = null;
    if (i === 0) {
      // This means we are dealing with the
      // root node.
      node = createNode(tokens[i]);
      result = node;
    } else {
      const p = tokens.slice(0, i + 1).join("/");
      node = createNode(p);
      if (latestNode) {
        latestNode.children.push(node);
      }
    }
    latestNode = node;
  }
  if (result) {
    return result;
  } else {
    throw new Error("unable to build node hierarchy");
  }
};

const addNode = (hi: Array<Node>, path: string) => {
  const node = createNode(path);
  let parent: null | Node = null;

  if (node.path === "") {
    // This means the node is a root node
    // we should only check if it has been
    // already appended:
    const exists = hi.some((n) => n.dir === node.dir);
    if (exists) {
      return;
    }
  }

  for (const rootNode of hi) {
    parent = getParentNode(rootNode, node);
    if (parent) {
      parent.children.push(node);
      return;
    }
  }

  if (!parent) {
    hi.push(createNodeHierarchy(node));
  }
};

export const buildHierarchy = (objs: Array<s3Types.S3Object>) => {
  const hi: Array<Node> = [];

  for (const o of objs) {
    let path = null;
    if (o.Size === 0) {
      path = o.Key;
      if (path.endsWith("/")) {
        path = o.Key.slice(0, -1);
      }
    } else {
      const tokens = o.Key.split("/");
      if (tokens.length > 1) {
        {
          path = tokens.slice(0, tokens.length - 1).join("/");
        }
      }
    }

    if (path) {
      addNode(hi, path);
    }
  }

  return hi;
};

const getHierarchySortedNodes = (hi: Array<Node>) => {
  const result: Array<string> = [];

  const recurse = (n: Node) => {
    result.push(n.fullpath === "" ? n.dir : n.fullpath);
    if (n.children.length > 0) {
      for (const child of n.children) {
        recurse(child);
      }
    }
  };

  for (const n of hi) {
    recurse(n);
  }

  return result;
};

export const getFilesCreationOrder = (objs: Array<s3Types.S3Object>) => {
  const hi = buildHierarchy(objs);
  return getHierarchySortedNodes(hi);
};
