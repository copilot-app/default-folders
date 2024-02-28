import axios from "axios";
import * as t from "./types";
import { z } from "zod";
//import { copilotApi } from "copilot-node-sdk";

const COPILOT_API_KEY = process.env?.COPILOT_API_KEY || "";
const COPILOT_API_VERSION = process.env?.COPILOT_API_VERSION || "v1";
const COPILOT_API_URL = process.env?.COPILOT_API_URL;

const COPILOT_ENDPOINT = `${COPILOT_API_URL}/${COPILOT_API_VERSION}`;

const basicHeaders = {
  accept: "application/json",
  "X-API-KEY": COPILOT_API_KEY,
};

export const getFileChannelId = async (memberId: string): Promise<string> => {
  const res = await axios({
    method: "GET",
    url: `${COPILOT_ENDPOINT}/channels/files`,
    params: {
      memberId,
    },
    headers: basicHeaders,
  });

  return z.string().parse(res.data.data[0].id);
  //const copilot = copilotApi({
  //  apiKey: COPILOT_API_KEY,
  //  token: ""
  //})
  //return copilot.listFileChannels({memberId})
};

export const getUploadUrl = async (filepath: string, channelId: string) => {
  const res = await axios({
    method: "POST",
    url: `${COPILOT_ENDPOINT}/files/file`,
    data: {
      path: filepath,
      channelId: channelId,
    },
    headers: {
      ...basicHeaders,
      "Content-Type": "application/json",
    },
  });

  return res.data.uploadUrl;
};

export const createFolder = async (filepath: string, channelId: string) => {
  return axios({
    method: "POST",
    url: `${COPILOT_ENDPOINT}/files/folder`,
    data: {
      path: filepath,
      channelId: channelId,
    },
    headers: {
      ...basicHeaders,
      "Content-Type": "application/json",
    },
  });
};
