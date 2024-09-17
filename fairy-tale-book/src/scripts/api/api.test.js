import request from "supertest";
import App from "../app";

const SECONDS = 1000;
const createTileTimeout = 30 * SECONDS;

describe("Test Create Title", () => {
    beforeEach(() => {}, createTileTimeout);
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
        },
        createTileTimeout
    );
});
