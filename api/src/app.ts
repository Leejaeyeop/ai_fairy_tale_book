import dotenv from "dotenv";
import express, { Express } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import controller from "./controller/controller";
import { WebSocketServer } from "ws";
import path from "path";

class App {
  public app: Express;
  public port: string | number;

  constructor() {
    dotenv.config();

    console.log(process.env.NODE_ENV);
    const __dirname = path.resolve();
    if (process.env.NODE_ENV === "development" || "test") {
      dotenv.config({ path: path.join(__dirname, ".env.development") });
    }

    this.app = express();
    this.port = process.env.PORT as string;
    this.app.use(bodyParser.json());

    this.app.use(
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
    const HTTPserver = this.app.listen(this.port, function () {
      console.log("The Api server has started");
    });
    // wesocket server open
    const wss = new WebSocketServer({ server: HTTPserver });

    controller.init(this.app, wss);
  }
}

export default App;
