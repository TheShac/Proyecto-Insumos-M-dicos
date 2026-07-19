import express from "express";
import { router } from "./routes/index.routes";
import { errorHandler } from "./middlewares/error.middleware";

export const app = express();
app.use(express.json());
app.use("/api", router);
app.use(errorHandler);