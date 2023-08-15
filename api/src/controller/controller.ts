import { Express, Request, Response } from "express";
import PdfHandler from "../modules/pdfHandler.js";
import openAi from "../externalApi/openAi.js";
import { createImgByStabilityApi } from "../externalApi/stabilityAi.js";

export function init(app: Express) {
    app.post("/api/books", async (req: Request, res: Response) => {
        console.log("init making a book!");

        let title = req.body.title;

        console.log(title);
        // pdf 파일 생성
        const pdfHandler = new PdfHandler();
        // story를 만든다.
        let texts = await openAi.createStory(title);

        // img를 만든다. cover 용 title(eng) + eng
        // let imgs = await createImgByDalleApi(texts.titleEng, texts.eng);
        let imgs = await createImgByStabilityApi(texts.titleEng, texts.eng);
        // cover 를 생성하기 위해 title text를 집어 넣는다.
        let coverTitle = title.split(":")[0].split(".")[1];
        texts.kor.unshift(coverTitle);

        // pdf를 만든다.
        await pdfHandler.createPdf(texts.kor, imgs);

        // Set HTTP response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=book.pdf");

        pdfHandler.getDoc().pipe(res);
        pdfHandler.getDoc().end();
    });

    app.post("/api/title", async (req: Request, res: Response) => {
        try {
            let data = req.body.data;
            // title를 만든다.
            let texts = await openAi.createTitles(data);
            res.json(texts);
        } catch (error) {
            console.log("error!");
            console.log(error);
            res.send(error);
        }
    });
}

export default {
    init,
};
