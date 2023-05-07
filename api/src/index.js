import dotenv from "dotenv";
import express from "express";
import { Configuration, OpenAIApi } from "openai";
import pdfDocumnet from "PDFKit";
import fs from "fs";
import https from "https";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
dotenv.config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const app = express();
const PORT = 3000;

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

    let prompt =
        "주인공이 " + data.mainCharacter + genre + ", 동화 이야기를 제목과 간략한 줄거리 5개 정도 추천해 주세요.";

    console.log(prompt);

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        // stop: [" "],
    });
    let text = response.data.choices[0].text;
    texts = text.split("\n");
    texts = texts.filter((text) => text !== "");
    console.log(texts);

    return texts;
}

async function createStory(title) {
    console.log("createStory!");
    let prompt =
        title +
        "\n 다음 내용으로 동화 이야기를 만들어 주세요. \n 이야기는 8개의 단락 으로 만들어 주세요. \n 영어와 한글로 각각 만들어 주세요.";
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        // stop: [" "],
    });
    let text = response.data.choices[0].text;

    let textSplited = [];
    textSplited = text.split("\n");
    textSplited = textSplited.filter((text) => text !== "");

    let texts = { kor: [], eng: [] };
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

async function createImg(texts) {
    imgs = [];
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

const __dirname = path.resolve();
function initPdf() {
    const dir = path.join(__dirname, "/resources/fonts/InkLipquidFonts.ttf");
    const doc = new pdfDocumnet();
    const fontBytes = fs.readFileSync(dir);
    doc.registerFont("InkLipquid", fontBytes);
    doc.font("InkLipquid").fontSize(28);

    return doc;
}

async function createPdf(doc, texts, imgs) {
    const imgPromises = [];
    for (let i = 0; i < imgs.length; i++) {
        let text = texts[i];
        let imgUrl = imgs[i];
        imgPromises.push(
            new Promise((resolve, reject) => {
                https
                    .get(imgUrl, (response) => {
                        const chunks = [];
                        response.on("data", (chunk) => {
                            chunks.push(chunk);
                        });
                        response.on("end", () => {
                            const buffer = Buffer.concat(chunks);
                            resolve({ buffer, text });
                        });
                    })
                    .on("error", (error) => {
                        reject(error);
                    });
            })
        );
    }

    // 순서를 보장한다... 즉, 여기서 buffer로 보내도 되고, pdf를 생성 해도 된다.
    for await (const { buffer, text } of imgPromises) {
        doc.addPage();
        doc.image(buffer).text(text);
    }

    doc.addPage();
    doc.text("- 이야기 끝 -");

    doc.pipe(fs.createWriteStream("output.pdf"));

    console.log("종료");
}

app.use(
    cors({
        origin: "http://localhost:8080", // Replace with your desired origin
        optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
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
    // Todo texts 를 영어로 변환

    // img를 만든다.
    let imgs = await createImg(texts.eng);
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
        console.log(data);
        // title를 만든다.
        let texts = await createTitles(data);
        res.json(texts);
    } catch (error) {
        res.send(error);
    }
});
