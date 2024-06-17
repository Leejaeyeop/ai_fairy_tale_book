import fetch from "node-fetch";

export async function createImgByStabilityApi(title: string, texts: string[]) {
  console.log("이미지 생성 시작");
  texts.unshift(title);

  const engineId = "stable-diffusion-512-v2-1";
  const apiHost = process.env.STABILITY_API_HOST ?? "https://api.stability.ai";
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) throw new Error("Missing Stability API key.");
  let images: any[] = [];
  for (let [index, text] of texts.entries()) {
    console.log(
      index === 0 ? text.split(":")[0] : text.split(":")[1].split(".")[0]
    );

    const response = await fetch(
      `${apiHost}/v1/generation/${engineId}/text-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text:
                index === 0
                  ? text.split(":")[0]
                  : text.split(":")[1].split(".")[0],
            },
          ],
          cfg_scale: 7,
          clip_guidance_preset: "FAST_BLUE",
          height: 512,
          width: 512,
          samples: 1,
          steps: 30,
          style_preset: "fantasy-art",
          // comic-book //anime
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Non-200 response: ${await response.text()}`);
    }

    const responseJSON: any = await response.json();

    responseJSON.artifacts.forEach((image: any) => {
      const buffer = Buffer.from(image.base64, "base64");
      images.push(buffer);
    });
  }

  console.log("이미지 생성 끝!");
  return images;
}
