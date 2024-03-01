import { v4 as uuid } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import path from "path";
import fs from "fs";
import logger from "../logger";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import * as s3Types from "./types";

const BUCKET = process?.env?.BUCKET || "";

export async function getSignedURL(key: string, mime: string) {
  const client = new S3Client();
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mime,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 3600 });

  return {
    url: url,
    key: key,
  };
}

export async function listFiles(
  reqId = "N/A"
): Promise<Array<s3Types.S3Object> | null> {
  logger.info(`${reqId}: Listing S3 files`);
  const client = new S3Client();

  const command = new ListObjectsV2Command({ Bucket: BUCKET });

  const response = await client.send(command);

  if (response?.Contents instanceof Array && response?.Contents?.length > 0) {
    logger.info(`${reqId}: Files Found: ${response.Contents.length}`);
    return response.Contents as unknown as Array<s3Types.S3Object>;
  }

  logger.info(`${reqId}: files found: 0`);
  return null;
}

type Path = string;

export async function downloadFiles(
  reqId: string,
  files: Array<string>
): Promise<Array<Path>> {
  logger.info(`${reqId}: getting files from S3`);
  const client = new S3Client();

  const dir = `/tmp/${uuid()}`;
  const result = [];
  for (const f of files) {
    logger.info(`${reqId}: downloading: ${f}`);
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: f });
    const resp = await client.send(cmd);
    const filepath = `${dir}/${f}`;
    createHierarchy(reqId, filepath);
    await saveFile(reqId, resp.Body, `${dir}/${f}`);
    result.push(filepath);
  }

  return result;
}

export async function saveFile(reqId: string, file: unknown, filepath: string) {
  logger.info(`${reqId}: Saving File: ${filepath}`);
  return new Promise((resolve, reject) => {
    if (file instanceof Readable) {
      file
        .pipe(fs.createWriteStream(filepath))
        .on("error", (err) => reject(err))
        .on("close", () => resolve(0));
    }
  });
}

async function createHierarchy(reqId: string, filepath: string) {
  const directoryPath = path.dirname(filepath);

  if (fs.existsSync(directoryPath)) {
    return;
  }

  logger.info(`${reqId}: creating file hierarchy: ${directoryPath}`);
  fs.mkdirSync(directoryPath, { recursive: true });
}

export async function createFolders(folders: Array<string>) {
  const client = new S3Client();

  for (const f of folders) {
    let key = f;
    if (!key.endsWith("/")) {
      key = `${key}/`;
    }

    const upload = new Upload({
      client,
      params: {
        Bucket: BUCKET,
        Key: key,
        Body: "",
      },
    });
    await upload.done();
  }
}
