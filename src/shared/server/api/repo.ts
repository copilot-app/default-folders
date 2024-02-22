import axios from "axios";
import * as t from "./types";
import { z } from "zod";
//import { copilotApi } from "copilot-node-sdk";

const COPILOT_API_KEY = process.env?.COPILOT_API_KEY || "";
const COPILOT_API_VERSION = process.env?.COPILOT_API_VERSION || "v1";
const COPILOT_API_URL = process.env?.COPILOT_API_URL;

export const getFileChannelId = async (memberId: string): Promise<string> => {
  const res = await axios({
    method: "GET",
    url: `${COPILOT_API_URL}/${COPILOT_API_VERSION}/channels/files`,
    params: {
      memberId,
    },
    headers: {
      "X-API-KEY": COPILOT_API_KEY,
    },
  });

  return z.string().parse(res.data.data[0].id)
  //const copilot = copilotApi({
  //  apiKey: COPILOT_API_KEY,
  //  token: ""
  //})
  //return copilot.listFileChannels({memberId})
};
