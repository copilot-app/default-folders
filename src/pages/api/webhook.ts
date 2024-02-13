// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuid } from "uuid";
import axios from "axios";
import * as s3 from "@/shared/s3";
import logger from "@/shared/logger";

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

  const objs = await s3.listFiles(reqId);

  let paths = null;
  if (objs) {
    const files = objs.map((obj) => obj.Key);
    paths = await s3.getFiles(reqId, files);
  }

  if (!(paths instanceof Array)) {
    logger.info(`${reqId}: no files to upload`);
    res.status(200).json({ name: "No files found for user" });
  }

  // --------------------------------------
  const copilot = copilotApi({
    apiKey: COPILOT_API_KEY,
    token: ""
  })
  const fileChannels = copilot.listFileChannels({memberId: req.body.data.id})
  // --------------------------------------

  const memberId = req.body.data.id;

  if (!memberId) {
    logger.info(`${reqId}: no member id`);
    res.status(400).json({ name: "no member id" });
  }

  logger.info(`${reqId}: using member id: ${memberId}`);

  const response = await axios({
    method: "GET",
    url: `${COPILOT_API_URL}/${COPILOT_API_VERSION}/channels/files`,
    params: {
      memberId,
    },
    headers: {
      "X-API-KEY": COPILOT_API_KEY,
    },
  });

  if (!(response?.data?.data instanceof Array)) {
    logger.error(`${reqId}: channel api response data is not an array`);
    res.status(400).json({ name: "unable to get member id" });
  }

  const data = response.data.data as Array<ChannelFields>;
  const channelId = data[0]?.id;

  if (!channelId) {
    logger.info(`${reqId}: no channel id`);
    res.status(400).json({ name: "no channel id" });
  }

  logger.info(`${reqId}: using channel id: ${channelId}`);

  for (const p of paths) {
    logger.info(`${reqId}: request link for local file at: ${p}`)
    const pathTokens = p.split("/") // Output: ["", "tmp", "some uuid", "start of path", "...."]
    const remotePathTokens = pathTokens.slice(3)
    const remotePath = remotePathTokens.join("/")
    logger.info(`${reqId}: upload file to: ${remotePath}`)

    const uploadLinkResp = await axios({
      method: "POST",
      url: `${COPILOT_API_URL}/${COPILOT_API_VERSION}/files/file`,
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": COPILOT_API_KEY,
      },
      data: {
        path: remotePath,
        channelId: channelId,
      },
    });
    
    const uploadUrl = uploadLinkResp.data.uploadUrl
    logger.info(`${reqId}: uploading file`)
    const uploadResp = await axios.put(uploadUrl, p)
    console.log(uploadResp)
  
  }

  res.status(200).json({ name: "Client file assets populated" });
}
