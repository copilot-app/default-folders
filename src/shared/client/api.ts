import axios from "axios";
import * as fileUtils from "./file-utils";
import * as apiTypes from "../types/api";
import * as nodeTypes from "../types/node";

const URL = process?.env?.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getSignedUrls(body: apiTypes.SignedUrlRequestBody) {
  const res = await axios({
    method: "POST",
    url: `${URL}/api/signed-url`,
    data: {
      files: body,
    },
    headers: {
      ContentType: "application/json",
    },
  });

  return res.data;
}

export async function putFileSignedUrl(
  url: string,
  file: File,
  mime: string
) {
  return axios.put(url, file, {
    headers: {
      "Content-Type": mime,
    },
  });
}

export async function createFolders(folders: Array<string>) {
  return axios({
    method: "POST",
    url: `${URL}/api/folder/create`,
    data: { folders },
    headers: {
      ContentType: "application/json",
    },
  });
}

export async function getFiles() {
  return axios.get(`${URL}/api/get-files`);
}

export async function uploadFilesystemEntries(
  nodes: Array<nodeTypes.SignedNode>
) {
  // Separate files from just folders:
  const files = nodes.filter((n) => n.type === "file");
  const dirs = nodes.filter((n) => n.type === "dir");

  if (files.length > 0) {
    for (const x of files) {
      const f = await fileUtils.getFile(x.entry);  
      if (x.signedUrl) {
        await putFileSignedUrl(x.signedUrl, f, x.mime);
      }
    }
  }
  if (dirs.length > 0) {
    const folders = dirs.map((d) => d.key);
    await createFolders(folders);
  }
}
