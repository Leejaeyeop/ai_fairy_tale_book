import request from "supertest";
import App from "./app";

describe("Test the root path", () => {
    const app = new App();
    test("It should response the GET method", async () => {
        const response = await request(app.app).get("/");
        expect(response.statusCode).toBe(200);
    });
});
