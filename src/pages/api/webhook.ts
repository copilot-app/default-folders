// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuid } from "uuid";
import axios from "axios";
import logger from "../../shared/server/logger";
import * as api from "../../shared/server/api/repo";
import * as s3 from "../../shared/server/datasources/s3";
import * as fileUtils from '../../shared/server/file-utils'

import { copilotApi } from "copilot-node-sdk";

const COPILOT_API_KEY = process.env?.COPILOT_API_KEY || "";
const COPILOT_API_VERSION = process.env?.COPILOT_API_VERSION || "v1";
const COPILOT_API_URL = process.env?.COPILOT_API_URL;

type Data = {
  name: string;
};

type ChannelFields = {
  id: string;
  object: "fileChannel";
  createdAt: string;
  updatedAt: string;
  membershipType: "individual";
  membershipEntityId: string;
  memberIds: Array<string>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const reqId = uuid();
  logger.info(`${reqId}: webhook triggered`);

  /*
  const memberId = req.body.data.id;

  if (!memberId) {
    logger.info(`${reqId}: no member id`);
    res.status(400).json({ name: "no member id" });
  }

  logger.info(`${reqId}: using member id: ${memberId}`);

  const channelId = await api.getFileChannelId(memberId);
  logger.info(`${reqId}: using channel id: ${channelId}`);
  */

  const objs = await s3.listFiles(reqId);

  if (objs){
    const dirNodes = fileUtils.buildHierarchy(objs)   
    console.log(JSON.stringify(dirNodes, null, 4))
  }

  /*
  let paths = null;
  if (objs) {
    const files = objs.map((obj) => obj.Key);
    paths = await s3.getFiles(reqId, files);
  }

  if (!(paths instanceof Array)) {
    logger.info(`${reqId}: no files to upload`);
    res.status(200).json({ name: "No files found for user" });
  } else {
    for (const p of paths) {
      logger.info(`${reqId}: request link for local file at: ${p}`);
      const pathTokens = p.split("/"); // Output: ["", "tmp", "some uuid", "start of path", "...."]

      // Construct the file path where to upload:
      const localFileTokens = pathTokens.slice(3);
      const remotePath = localFileTokens.join("/");
      logger.info(`${reqId}: upload file to: ${remotePath}`);

      const url = await api.getUploadUrl(remotePath, channelId)
      logger.info(`${reqId}: uploading file`);
      await axios.put(url, p);
    }
  }
  */

  res.status(200).json({ name: "Client file assets populated" });
}
