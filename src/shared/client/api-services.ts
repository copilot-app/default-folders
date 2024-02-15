import axios from "axios";
import * as apiTypes from '../types/api'

const URL = process?.env?.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getSignedUrls(body: apiTypes.SignedUrlRequestBody) {
  const res = await axios({
    method: "POST",
    url: `${URL}/api/signed-url`,
    data: {
      files: body
    },
    headers: {
      ContentType: "application/json",
    },
  });

  return res.data
}

export async function putFileSignedUrl(url: string, file: string, mime: string){
  console.log('PUT:',url)
  return axios.put(url, file, {
    headers: {
      'Content-Type': mime
    }
  })
}
