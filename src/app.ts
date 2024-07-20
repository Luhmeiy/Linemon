import express from "express";
import createRouter from "express-file-routing";
import path from "path";
import { fileURLToPath } from "url";
import { getRoute } from "./utils/getRoute.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await createRouter(app, {
	directory: path.join(__dirname, "routes"),
});

app.listen(3000);

await getRoute("start/");
