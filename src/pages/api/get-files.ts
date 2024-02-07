import type { NextApiRequest, NextApiResponse } from "next";
import { getSignedURL } from "@/shared/s3";
import { z } from "zod";

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
  if (req.method === "POST") {
    res.status(405).json({ message: "GET Not Allowed" });
  }
  
}
