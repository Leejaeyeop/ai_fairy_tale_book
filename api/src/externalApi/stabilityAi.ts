import fetch from "node-fetch";
import fs from "node:fs";

export async function fetchStabilityApi() {
    console.log("시작");
    const engineId = "stable-diffusion-v1-5";
    const apiHost = process.env.API_HOST ?? "https://api.stability.ai";
    const apiKey = process.env.STABILITY_API_KEY;

    if (!apiKey) throw new Error("Missing Stability API key.");

    const response = await fetch(`${apiHost}/v1/generation/${engineId}/text-to-image`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            text_prompts: [
                {
                    text: "Lee Jae-yeop meets a bear friend in the forest one day. He travels with bears, relieves stress, plays with other creatures, and learns new things. He also learns to deal with his emotions with bears.",
                },
            ],
            cfg_scale: 7,
            clip_guidance_preset: "FAST_BLUE",
            height: 256,
            width: 256,
            samples: 1,
            steps: 30,
        }),
    });

    if (!response.ok) {
        throw new Error(`Non-200 response: ${await response.text()}`);
    }

    interface GenerationResponse {
        artifacts: Array<{
            base64: string;
            seed: number;
            finishReason: string;
        }>;
    }

    const responseJSON = (await response.json()) as GenerationResponse;
    console.log("끝");

    responseJSON.artifacts.forEach((image, index) => {
        fs.writeFileSync(`./out/v1_txt2img_${index}.png`, Buffer.from(image.base64, "base64"));
    });
    console.log("끝");
}

export async function createImgByStabilityApi(title: string, texts: string[]) {
    console.log("시작");
    texts.unshift(title);

    const engineId = "stable-diffusion-v1-5";
    const apiHost = process.env.API_HOST ?? "https://api.stability.ai";
    const apiKey = process.env.STABILITY_API_KEY;

    if (!apiKey) throw new Error("Missing Stability API key.");
    let images: Buffer[] = [];
    for (let text of texts) {
        const response = await fetch(`${apiHost}/v1/generation/${engineId}/text-to-image`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${apiKey}`,
            },

            body: JSON.stringify({
                text_prompts: [{ text: text }],
                cfg_scale: 7,
                clip_guidance_preset: "FAST_BLUE",
                height: 512,
                width: 512,
                samples: 1,
                steps: 30,
                style_preset: "fantasy-art",
                // comic-book //anime
            }),
        });

        if (!response.ok) {
            throw new Error(`Non-200 response: ${await response.text()}`);
        }

        const responseJSON: any = await response.json();

        responseJSON.artifacts.forEach((image: any) => {
            const buffer = Buffer.from(image.base64, "base64");
            images.push(buffer);
            // fs.writeFileSync(`v1_txt2img_${index}.png`, Buffer.from(image.base64, "base64"));
        });
    }

    return images;
}
