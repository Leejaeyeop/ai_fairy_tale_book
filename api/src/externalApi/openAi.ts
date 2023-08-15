import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import path from "path";
const __dirname = path.resolve();

type Texts = {
    kor: string[];
    eng: string[];
    titleEng: string;
};

class OpenAi {
    #openai: OpenAIApi;
    imgs: string[] = [];

    constructor() {
        dotenv.config();
        if (process.env.NODE_ENV === "production") {
            dotenv.config({ path: path.join(__dirname, ".env.production") });
        } else if (process.env.NODE_ENV === "develop") {
            dotenv.config({ path: path.join(__dirname, ".env.develop") });
        } else {
            throw new Error("process.env.NODE_ENV를 설정하지 않았습니다!");
        }
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.#openai = new OpenAIApi(configuration);
    }
    async createTitles(data: any) {
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
            const response: any = await this.#openai.createChatCompletion({
                model: "gpt-4",
                messages: [
                    {
                        role: "user",
                        content: content,
                    },
                ],
            });
            let text: string = response.data.choices[0].message.content;
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

    async createStory(title: string): Promise<Texts> {
        console.log("createStory!");
        let texts: Texts = { kor: [], eng: [], titleEng: "" };
        let content = "다음을 영어로 번역해 주세요. " + title;
        let response: any = await this.#openai.createChatCompletion({
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
        response = await this.#openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: content,
                },
            ],
        });
        let text = response.data.choices[0].message.content;

        let textSplited: string[] = [];
        textSplited = text.split("\n");
        textSplited = textSplited.filter((text) => text !== "");

        for (let text of textSplited) {
            console.log(text);
            if (text.length < 10) continue;

            if (this.checkLanguage(text) === "English") {
                texts.eng.push(text);
            } else if (this.checkLanguage(text) === "Korean") {
                texts.kor.push(text);
            }
        }

        return texts;
    }

    checkLanguage(str: string): string {
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

    async createImgByDalleApi(title: string, texts: string[]) {
        this.imgs = [];
        texts.unshift(title);
        for (let text of texts) {
            const response: any = await this.#openai.createImage({
                prompt: text,
                n: 1,
                size: "256x256",
            });
            this.imgs.push(response.data.data[0].url as string);
        }
        console.log(this.imgs);
        return this.imgs;
    }
}

export default new OpenAi();
