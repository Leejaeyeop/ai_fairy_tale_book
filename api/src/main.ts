import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import controller from "./controller/controller.js";
import { WebSocketServer } from "ws";
import path from "path";

dotenv.config();

console.log(process.env.NODE_ENV);
const __dirname = path.resolve();
if (process.env.NODE_ENV === "development") {
    dotenv.config({ path: path.join(__dirname, ".env.development") });
}

const app = express();
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
const HTTPserver = app.listen(PORT, function () {
    console.log("The Api server has started");
});
// wesocket server open
const wss = new WebSocketServer({ server: HTTPserver });

controller.init(app, wss);
