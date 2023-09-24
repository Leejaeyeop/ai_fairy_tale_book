import { Express, Request, Response } from "express";
import PdfHandler from "../modules/pdfHandler.js";
import openAi from "../externalApi/openAi.js";
import { createImgByStabilityApi } from "../externalApi/stabilityAi.js";
import { createImgByDeepApi } from "../externalApi/deepAi.js";
import { WebSocketServer } from "ws";
import blobStream from "blob-stream";

export function init(app: Express, wss: WebSocketServer) {
    app.get("/api/v1/title", async (req: Request, res: Response) => {
        try {
            let data = req.query;
            // title를 만든다.
            let texts = await openAi.createTitles(data);
            res.json(texts);
        } catch (error) {
            console.log("error!");
            console.log(error);
            res.send(error);
        }
    });

    wss.on("connection", async (ws, request) => {
        console.log(request.url);
        // 1) 연결 클라이언트 IP 취득
        const ip = request.headers["x-forwarded-for"] || request.connection.remoteAddress;

        // 3) 클라이언트로부터 메시지 수신 이벤트 처리
        ws.on("message", async (msg) => {
            let title = msg.toString();

            console.log(title);
            // pdf 파일 생성
            const pdfHandler = new PdfHandler();

            let chunk = JSON.stringify({ beginStage: 1 });
            ws.send(chunk);
            // story를 만든다.
            let texts = await openAi.createStory(title);

            chunk = JSON.stringify({ beginStage: 2 });
            ws.send(chunk);

            // img를 만든다. cover 용 title(eng) + eng
            let imgs = await createImgByDeepApi(texts.titleEng, texts.eng);

            chunk = JSON.stringify({ beginStage: 3 });
            ws.send(chunk);
            // cover 를 생성하기 위해 title text를 집어 넣는다.
            let coverTitle = title.split(":")[0].split(".")[1];
            texts.kor.unshift(coverTitle);

            // pdf를 만든다.
            await pdfHandler.createPdf(texts.kor, imgs);

            const stream = pdfHandler.getDoc().pipe(blobStream());
            stream.on("finish", async function () {
                // get a blob you can do whatever you like with
                const blob = stream.toBlob("application/pdf");
                console.log(blob);
                let res = await blob.arrayBuffer();
                // const blobData = new Blob(["Hello, client!"], { type: "text/plain" }) as any;
                ws.send(res);
                pdfHandler.getDoc().end();
            });
        });

        // 4) 에러 처러
        ws.on("error", (error) => {
            console.log(`클라이언트[${ip}] 연결 에러발생 : ${error}`);
        });

        // 5) 연결 종료 이벤트 처리
        ws.on("close", () => {
            console.log(`클라이언트[${ip}] 웹소켓 연결 종료`);
        });
    });
}

export default {
    init,
};
