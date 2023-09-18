import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

type Texts = {
    kor: string[];
    eng: string[];
    titleEng: string;
};

class OpenAi {
    #openai: OpenAIApi;
    #titleCnt = 4;
    #paraCnt = 5;

    constructor() {
        dotenv.config();

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
            genre = "주제가 " + genre;
        } else {
            genre = "";
        }

        let content = `주인공의 이름이 ${data.mainCharacter}, ${genre}, 동화 이야기를 제목과 간략한 줄거리 ${
            this.#titleCnt
        }개 정도 추천해 주세요. ':' 로 제목과 줄거리를 구분해주세요. 제가 예시를 보여드리겠습니다. 잠자는 숲속의 공주: 옛날 옛적에 숲속의 공주가 ~... 절대로 '제목: 잠자는 숲속의 공주' 이런식으로 앞에 '제목'이나 '줄거리' 라는 단어를 붙이지 말아 주세요. `;

        console.log(content);
        try {
            const response: any = await this.#openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: content,
                    },
                ],
            });
            let text: string = response.data.choices[0].message.content;
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
            model: "gpt-3.5-turbo",
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
            `Please make a fairy tale story with the following content. Please make the story into ${
                this.#paraCnt
            } paragraphs. And please do it in the form of 'Number: Contents', like 1: content~ 2: content~. `;
        response = await this.#openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: content,
                },
            ],
        });
        let text = response.data.choices[0].message.content;

        content = `다음을 한글로 번역해 주세요. 
        ${text}`;

        response = await this.#openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: content,
                },
            ],
        });
        text += "\n" + response.data.choices[0].message.content;

        let textSplited: string[] = [];
        textSplited = text.split("\n");
        textSplited = textSplited.filter((text) => text !== "");

        for (let text of textSplited) {
            if (text.length < 10) continue;

            if (this.checkLanguage(text) === "English") {
                texts.eng.push(text);
            } else if (this.checkLanguage(text) === "Korean") {
                texts.kor.push(text);
            }
        }
        console.log(texts);

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
        let imgs: any[] = [];
        texts.unshift(title);
        for (let text of texts) {
            const response: any = await this.#openai.createImage({
                prompt: text,
                n: 1,
                size: "256x256",
            });
            imgs.push(response.data.data[0].url as string);
        }
        return imgs;
    }
}

export default new OpenAi();
