import type { NextApiRequest, NextApiResponse } from "next";
import { getSignedURL } from "../../shared/server/s3";
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
    const url = await getSignedURL(files[i].key, files[i].mime);
    console.log(url)
    Object.assign(signedUrls, {[files[i].key]: url})
  }

  res.status(200).json(signedUrls);
}
