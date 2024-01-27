import axios from 'axios'

const COPILOT_API_KEY = process.env?.COPILOT_API_KEY
const COPILOT_API_VERSION = process.env?.COPILOT_API_VERSION || "v1"
const COPILOT_API_URL = process.env?.COPILOT_API_URL


export default defineEventHandler(async(event) => {
  
  if (typeof COPILOT_API_KEY === 'undefined'){
    return setResponseStatus(event, 401)
  }
  
  if (typeof COPILOT_API_URL === 'undefined'){
    return setResponseStatus(event, 401)
  }

  const body = await readBody(event)
  
  const memberId = body.data.id

  const resp = await axios({
    method: 'get',
    url: `${COPILOT_API_URL}/${COPILOT_API_VERSION}/channels/files`,
    params: {
      memberId
    },
    headers: {
      'X-API-KEY': COPILOT_API_KEY
    }
  })  
  
  const data = resp.data.data

  console.log(data)


  return "Webhook executed successfully"
})
