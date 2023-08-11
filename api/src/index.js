import dotenv from "dotenv";
import express from "express";
import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import https from "https";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import PDFDocument from "pdfkit";
const __dirname = path.resolve();

dotenv.config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const app = express();

if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: path.join(__dirname, ".env.production") });
} else if (process.env.NODE_ENV === "develop") {
    dotenv.config({ path: path.join(__dirname, ".env.develop") });
} else {
    throw new Error("process.env.NODE_ENV를 설정하지 않았습니다!");
}

const PORT = process.env.PORT;
// sample data
let imgs = [];

app.use(bodyParser.json());

async function createTitles(data) {
    console.log("createTitle!");
    let texts = [];
    let genre = data.genre;
    if (genre !== "아무거나") {
        genre = ", 주제가 " + genre;
    } else {
        genre = "";
    }

    let content =
        "주인공이 " +
        data.mainCharacter +
        genre +
        ", 동화 이야기를 제목과 간략한 줄거리 5개 정도 추천해 주세요. 제목과 이야기는 ':'로 구분 해 주세요.";

    console.log(content);

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: content,
                },
            ],
        });
        let text = response.data.choices[0].message.content;
        console.log(text);
        texts = text.split("\n");
        texts = texts.filter((text) => text !== "");
        console.log(texts);
        return texts;
    } catch (e) {
        console.log(e);
        return e;
    }
}

async function createStory(title) {
    console.log("createStory!");
    let texts = { kor: [], eng: [], titleEng: "" };
    let content = "다음을 영어로 번역해 주세요. " + title;
    let response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
            {
                role: "user",
                content: content,
            },
        ],
    });
    texts.titleEng = response.data.choices[0].message.content;

    content =
        title +
        "Please make a fairy tale story with the following content. Please make the story into 5 paragraphs. And please do it in the form of 'Number: Contents', like '1: content~ 2.content~'. Please make it in English and Korean respectively with separted paragraphs";
    response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
            {
                role: "user",
                content: content,
            },
        ],
    });
    let text = response.data.choices[0].message.content;

    let textSplited = [];
    textSplited = text.split("\n");
    textSplited = textSplited.filter((text) => text !== "");

    for (let text of textSplited) {
        console.log(text);
        if (text.length < 10) continue;

        if (checkLanguage(text) === "English") {
            texts.eng.push(text);
        } else if (checkLanguage(text) === "Korean") {
            texts.kor.push(text);
        }
    }

    console.log(texts);
    return texts;
}

function checkLanguage(str) {
    const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
    const englishRegex = /[a-zA-Z]/;

    if (koreanRegex.test(str)) {
        return "Korean";
    } else if (englishRegex.test(str)) {
        return "English";
    } else {
        return "Other";
    }
}

async function createImgByDalleApi(title, texts) {
    imgs = [];
    texts.unshift(title);
    for (let text of texts) {
        const response = await openai.createImage({
            prompt: text,
            n: 1,
            size: "256x256",
        });
        imgs.push(response.data.data[0].url);
    }
    console.log(imgs);
    return imgs;
}

function initPdf() {
    const dir = path.join(__dirname, "/resources/fonts/InkLipquidFonts.ttf");
    const doc = new PDFDocument();
    const fontBytes = fs.readFileSync(dir);
    doc.registerFont("InkLipquid", fontBytes);
    doc.font("InkLipquid").fontSize(28);

    return doc;
}

async function createPdf(doc, texts, imgs) {
    const textAndImgs = [];
    // stability api
    for (let i = 0; i < imgs.length; i++) {
        let text = texts[i];
        let img = imgs[i];
        textAndImgs.push({
            text: text,
            img: img,
        });
    }
    let i = 0;
    for await (const { img, text } of textAndImgs) {
        if (i === 0) {
            // 표지 만들기
            doc.font("InkLipquid").fontSize(46);
            doc.image(img, 0, 0, {
                width: doc.page.width,
                height: doc.page.height,
            }).text(text, doc.page.width / 2, doc.page.height / 2);
        } else {
            doc.addPage();
            doc.font("InkLipquid").fontSize(28);
            // 기본
            doc.image(img, {
                fit: [450, 450],
                align: "center",
                valign: "center",
            }).text(text);
        }
        i++;
    }

    doc.addPage();
    doc.text("- 이야기 끝 -");

    doc.pipe(fs.createWriteStream("output.pdf"));

    console.log("종료");
}

app.use(
    cors({
        origin: [
            "http://localhost:8080",
            "https://leejaeyeop.github.io",
            "https://web-fairytale-frontend-7e6o2cli06bdq9.sel4.cloudtype.app",
        ], // Replace with your desired origin
        credentials: true,
        optionsSuccessStatus: 200,
    })
);

// server open
app.listen(PORT, function () {
    console.log("server is running");
    // main();
});

app.post("/api/books", async (req, res) => {
    console.log("init making a book!");

    let title = req.body.title;

    console.log(title);
    // pdf 파일 생성
    const doc = initPdf();
    // story를 만든다.
    let texts = await createStory(title);
    // img를 만든다. cover 용 title(eng) + eng
    // let imgs = await createImgByDalleApi(texts.titleEng, texts.eng);
    let imgs = await createImgByStabilityApi(texts.titleEng, texts.eng);
    // cover 를 생성하기 위해 title text를 집어 넣는다.
    let coverTitle = title.split(":")[0].split(".")[1];
    texts.kor.unshift(coverTitle);

    // pdf를 만든다.
    await createPdf(doc, texts.kor, imgs);

    // Set HTTP response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=book.pdf");

    doc.pipe(res);
    doc.end();
});

app.post("/api/title", async (req, res) => {
    try {
        let data = req.body.data;
        // title를 만든다.
        let texts = await createTitles(data);
        res.json(texts);
    } catch (error) {
        console.log("error!");
        console.log(error);
        res.send(error);
    }
});

import fetch from "node-fetch";

export async function createImgByStabilityApi(title, texts) {
    console.log("시작");
    texts.unshift(title);

    const engineId = "stable-diffusion-v1-5";
    const apiHost = process.env.API_HOST ?? "https://api.stability.ai";
    const apiKey = process.env.STABILITY_API_KEY;

    if (!apiKey) throw new Error("Missing Stability API key.");
    let images = [];
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

        const responseJSON = await response.json();

        responseJSON.artifacts.forEach((image) => {
            const buffer = Buffer.from(image.base64, "base64");
            images.push(buffer);
            // fs.writeFileSync(`v1_txt2img_${index}.png`, Buffer.from(image.base64, "base64"));
        });
    }

    return images;
}
