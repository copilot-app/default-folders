import axios from "axios";

export async function getSignedUrls(
  input: Array<{ key: string; mime: string }>
) {
  const res = await axios({
    method: "POST",
    url: `${URL}/api/signed-url`,
    data: {
      files: input.map((entry) => ({
        key: entry.key,
        mime: entry.mime,
      })),
    },
    headers: {
      ContentType: "application/json",
    },
  });

  return res.data
}
