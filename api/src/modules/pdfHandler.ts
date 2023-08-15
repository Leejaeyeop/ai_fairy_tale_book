import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

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

    async createPdf(texts: string[], imgs: Buffer[]) {
        const textAndImgs = [];
        // stability api
        for (let i = 0; i < imgs.length; i++) {
            let text = texts[i];
            let img = imgs[i];
            textAndImgs.push({
                text: text,
                img: img,
            });
        }
        let i = 0;
        for await (const { img, text } of textAndImgs) {
            if (i === 0) {
                // 표지 만들기
                this.#doc.font("InkLipquid").fontSize(46);
                this.#doc
                    .image(img, 0, 0, {
                        width: this.#doc.page.width,
                        height: this.#doc.page.height,
                    })
                    .text(text, this.#doc.page.width / 2, this.#doc.page.height / 2);
            } else {
                this.#doc.addPage();
                this.#doc.font("InkLipquid").fontSize(28);
                // 기본
                this.#doc
                    .image(img, {
                        fit: [450, 450],
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
}
