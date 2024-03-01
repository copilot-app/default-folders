import type { NextApiRequest, NextApiResponse } from "next";
import * as s3 from "@/shared/server/s3/repo";
import { v4 as uuid } from "uuid";

import { z } from "zod";
import logger from "@/shared/server/logger";

type ResponseData = {
  message: string;
};

const BodySchema = z.object({
  folders: z.array(z.string()),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { message: string }>
) {
  const reqId = uuid();
  logger.info(`${reqId}: creating folders`);

  if (req.method === "GET") {
    res.status(405).json({ message: "GET Not Allowed" });
  }

  const parsedBody = BodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ message: "invalid request body" });
  }

  await s3.createFolders(req.body.folders);

  res.status(200).json({ message: "folders created" });
}
