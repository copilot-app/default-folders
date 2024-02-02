import type { NextApiRequest, NextApiResponse } from "next";
import { getSignedURL } from "@/shared/s3";

type ResponseData = {
  message: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
){

  if (req.method === "POST"){
    console.log(req.body)
    res.status(200).json({message: "Signed URLS Created"})
  }
  
  // const signedUrlData = getSignedURL(key, mime)
  res.status(405).json({message: "GET Not Allowed"})
}
