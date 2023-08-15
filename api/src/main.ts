import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import controller from "./controller/controller.js";
const __dirname = path.resolve();

dotenv.config();
const app = express();

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: path.join(__dirname, ".env.production") });
} else if (process.env.NODE_ENV === "develop") {
    dotenv.config({ path: path.join(__dirname, ".env.develop") });
} else {
    throw new Error("process.env.NODE_ENV를 설정하지 않았습니다!");
}

const PORT = process.env.PORT;

app.use(bodyParser.json());

app.use(
    cors({
        origin: [
            "http://localhost:8080",
            "https://leejaeyeop.github.io",
            "https://web-fairytale-frontend-7e6o2cli06bdq9.sel4.cloudtype.app",
        ],
        credentials: true,
        optionsSuccessStatus: 200,
    })
);

// server open
app.listen(PORT, function () {
    console.log("The Api server has started!");
});

controller.init(app);
