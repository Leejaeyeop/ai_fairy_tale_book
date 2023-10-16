import request from "supertest";
import App from "../app";
import OpenAi from "../externalApi/openAi";

const SECONDS = 1000;
const createTileTimeout = 30 * SECONDS;
const createStoryTimeout = 60 * SECONDS;

describe("Test Create Title", () => {
    beforeEach((): void => {}, createTileTimeout);
    test(
        "It should response the GET method",
        async () => {
            const app = new App();

            const data = {
                genre: "외국 전래동화",
                mainCharacter: "김철수",
            };
            const url = `/api/v1/title?genre=${data.genre}&mainCharacter=${data.mainCharacter}`;
            const response = await request(app.app).get(encodeURI(url));
            expect(response.statusCode).toBe(200);
            // console.log(response);
        },
        createTileTimeout
    );
});

describe("Test Create Story", () => {
    beforeEach((): void => {}, createTileTimeout);
    test(
        "It should response",
        async () => {
            new App();

            const openAi = new OpenAi();

            const title =
                "라푼젤: 김철수는 경쾌한 헤어스타일리스트의 라푼젤을 만난다. 그녀의 긴 머리카락은 마법의 힘을 지니고 있어 신기한 아이템이 된다. 김철수는 라푼젤과 함께 여행을 떠나 사랑과 용기를 발견하는 이야기.";
            const response = await openAi.createStory(title);
            expect(response.eng.length).toBeGreaterThan(1);
            expect(response.kor.length).toBeGreaterThan(1);
            // expect(response.titleEng).toBeGreaterThan(1);

            // console.log(response);
        },
        createStoryTimeout
    );
});
