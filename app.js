import express, { json } from "express";
import errorHandler from "./src/middlewares/error.middlewares.js"

const app = express();
app.use(json());

import eventRouter from "./src/routes/event.router.js";
app.use('/api/event', eventRouter);

app.use(errorHandler);

export default app;
