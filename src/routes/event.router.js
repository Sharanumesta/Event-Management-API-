import { Router } from "express";
import { createEvent, registerForEvent } from "../controllers/events.controller.js";
import { validateEvent, validateUserRegistration } from "../middlewares/validation.middlewares.js";

const eventRouter = Router();

eventRouter.route("/create").post(validateEvent,createEvent);
eventRouter.route("/register").post(validateUserRegistration,registerForEvent);

export default eventRouter;
