import type { NextApiRequest, NextApiResponse } from "next";
import * as s3 from "@/shared/server/s3";

import { z } from "zod";

type ResponseData = {
  message: string;
  files: string[];
};

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
  if (req.method === "POST") {
    res.status(405).json({ message: "POST Not Allowed" });
  }

  const allFiles = await s3.listFiles();
  console.log(allFiles);
  let files: Array<string> = []
  if (allFiles instanceof Array){
    files = allFiles.map((f) => f.Key);
  }
  res.status(200).json({ message: "files found", files });
}
