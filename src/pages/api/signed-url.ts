import type { NextApiRequest, NextApiResponse } from "next";
import * as s3 from "../../shared/server/datasources/s3";
import { z } from "zod";
import {v4 as uuid} from 'uuid'
import logger from "@/shared/server/logger";

type ResponseData = Record<
  string,
  {
    key: string;
    url: string;
  }
>;

const BodySchema = z.object({
  files: z.array(
    z.object({
      mime: z.string(),
      key: z.string(),
    })
  ),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { message: string }>
) {
  const reqId = uuid()
  logger.info(`${reqId}: generating signed urls`)
  if (req.method === "GET") {
    res.status(405).json({ message: "GET Not Allowed" });
  }

  const parse = BodySchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).json({ message: "Invalid request body" });
  }

  const files = req.body.files;
  const signedUrls = {};
  for (let i = 0; i < files.length; i++) {
    const url = await s3.getSignedURL(files[i].key, files[i].mime);
    Object.assign(signedUrls, {[files[i].key]: url})
  }

  logger.info(`${reqId}: signed urls generated succesfully`)
  res.status(200).json(signedUrls);
}
