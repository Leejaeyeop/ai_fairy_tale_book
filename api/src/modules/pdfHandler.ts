import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import https from "https";
import { Url } from "url";

export default class PdfHandler {
    #doc;
    constructor() {
        this.#doc = this.initPdf();
    }

    getDoc() {
        return this.#doc;
    }

    initPdf() {
        const __dirname = path.resolve();
        const dir = path.join(__dirname, "/resources/fonts/InkLipquidFonts.ttf");
        const doc = new PDFDocument();
        const fontBytes = fs.readFileSync(dir);
        doc.registerFont("InkLipquid", fontBytes);
        doc.font("InkLipquid").fontSize(28);

        return doc;
    }

    async createPdf(texts: string[], imgs: Url[]) {
        const imgPromises: any[] = [];
        for (let i = 0; i < imgs.length; i++) {
            let text = texts[i];
            let imgUrl = imgs[i];
            imgPromises.push(
                new Promise((resolve, reject) => {
                    https
                        .get(imgUrl, (response) => {
                            const chunks: any = [];
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
                this.#doc
                    .image(buffer, 0, 0, {
                        width: this.#doc.page.width,
                        height: this.#doc.page.height,
                    })
                    .text(text, this.#doc.page.width / 2, this.#doc.page.height / 2);
            } else {
                this.#doc.addPage();
                // 기본
                this.#doc
                    .image(buffer, {
                        fit: [500, 500],
                        align: "center",
                        valign: "center",
                    })
                    .text(text);
            }
            i++;
        }

        this.#doc.addPage();
        this.#doc.text("- 이야기 끝 -");

        this.#doc.pipe(fs.createWriteStream("output.pdf"));

        console.log("종료");
    }

    test() {
        this.#doc.addPage();
        this.#doc.text("- 이야기 끝 -");

        this.#doc.pipe(fs.createWriteStream("output.pdf"));
    }
}
