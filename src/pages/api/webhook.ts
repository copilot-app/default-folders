// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios'
//import { copilotApi } from "copilot-node-sdk";

const COPILOT_API_KEY = process.env?.COPILOT_API_KEY || ""
const COPILOT_API_VERSION = process.env?.COPILOT_API_VERSION || "v1"
const COPILOT_API_URL = process.env?.COPILOT_API_URL

type Data = {
  name: string;
};

type ChannelFields = {
  id: string
  object: "fileChannel"
  createdAt: string
  updatedAt: string
  membershipType: "individual"
  membershipEntityId: string
  memberIds: Array<string>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  console.log(req.body)

  //const copilot = copilotApi({
  //  apiKey: COPILOT_API_KEY,
  //  token: ""
  //})
   
  //const fileChannels = copilot.listFileChannels({memberId: req.body.data.id})
  
  const memberId = req.body.data.id

  const resp = await axios({
    method: "GET",
    url: `${COPILOT_API_URL}/${COPILOT_API_VERSION}/channels/files`,
    params:{
      memberId
    },
    headers: {
      'X-API-KEY': COPILOT_API_KEY
    }
  })

  const data = resp.data as Array<ChannelFields> 

  console.log(JSON.stringify(data, null, 4))


  res.status(200).json({ name: "Client file assets populated" });
}
