import deepai from "deepai";

export async function createImgByDeepApi(title: string, texts: string[]) {
  console.log("이미지 생성 시작");
  const apiKey = process.env.DEEPAI_API_KEY as string;

  deepai.setApiKey(apiKey);

  texts.unshift(title);

  if (!apiKey) throw new Error("Missing DEEPAI API key.");
  let images: any[] = [];
  for (let text of texts) {
    await (async function () {
      text =
        text.split(".")[0].length < 2
          ? text.split(".")[1]
          : text.split(".")[0] ?? text;
      const resp = await deepai.callStandardApi(
        "fantasy-world-generator" as any,
        {
          text: text,
          grid_size: "1",
        }
      );
      images.push(resp.output_url);
    })();
  }

  console.log("이미지 생성 끝!");
  return images;
}
