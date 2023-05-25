import dotenv from "dotenv";
import express from "express";
import { Configuration, OpenAIApi } from "openai";
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
    let texts = { kor: [], eng: [], titleEng: "" };
    let prompt = "다음을 영어로 번역해 주세요. " + title;
    let response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        // stop: [" "],
    });
    texts.titleEng = response.data.choices[0].text;

    prompt =
        title +
        "Please make a fairy tale story with the following content. Please make the story into 8 paragraphs. And please do it in the form of 'Number: Contents', liek '1: content~ 2.content~'. Please make it in English and Korean respectively.";
    // "\n 다음 내용으로 동화 이야기를 만들어 주세요. \n 이야기는 8개의 단락 으로 만들어 주세요. 그리고 '숫자 : 내용' 형식으로 해주세요. \n 영어와 한글로 각각 만들어 주세요.";
    response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0,
        max_tokens: 3048,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        // stop: [" "],
    });
    let text = response.data.choices[0].text;

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

async function createImg(title, texts) {
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

    let i = 0;
    // 1페이지 에는 cover를 넣는다!
    // 순서를 보장한다... 즉, 여기서 buffer로 보내도 되고, pdf를 생성 해도 된다.
    for await (const { buffer, text } of imgPromises) {
        if (i === 0) {
            // 표지 만들기
            doc.image(buffer, 0, 0, {
                width: doc.page.width,
                height: doc.page.height,
            }).text(text, doc.page.width / 2, doc.page.height / 2);
        } else {
            doc.addPage();
            // 기본
            doc.image(buffer, {
                fit: [500, 500],
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
        origin: ["http://localhost:8080", "https://leejaeyeop.github.io"], // Replace with your desired origin
        credentials: true,
        optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
    })
);

// server open
app.listen(PORT, function () {
    console.log("server is running");
    // main();
});

app.post("/api/books", cors(), async (req, res) => {
    console.log("init making a book!");

    let title = req.body.title;

    console.log(title);
    // pdf 파일 생성
    const doc = initPdf();
    // story를 만든다.
    let texts = await createStory(title);
    // img를 만든다. cover 용 title(eng) + eng
    let imgs = await createImg(texts.titleEng, texts.eng);
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

app.post("/api/title", cors(), async (req, res) => {
    try {
        let data = req.body.data;
        console.log(data);
        // title를 만든다.
        let texts = await createTitles(data);
        console.log("끝!");
        res.json(texts);
    } catch (error) {
        console.log("error!");
        console.log(error);
        res;
        res.send(error);
    }
});

// createStory(
//     " 황금의 여왕: 이재엽은 자신의 모험을 시작하기 위해 작은 마을에서 멀리 떠납니다. 그는 자신의 모험을 위해 가는 길에 황금의 여왕을 만나게 됩니다. 여왕은 이재엽에게 그녀가 지키고 있는 황금의 보물을 찾아야 한다고 말합니다. 이재엽은 여왕의 부탁을 받고 모험을 시작합니다."
// );
