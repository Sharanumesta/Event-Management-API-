import { Router } from "express";
import {
  createEvent,
  registerForEvent,
  getEventsWithUsers,
  cancelRegistration
} from "../controllers/events.controller.js";
import {
  validateEvent,
  validateUserRegistration,
} from "../middlewares/validation.middlewares.js";

const eventRouter = Router();

eventRouter.route("/create").post(validateEvent, createEvent);
eventRouter.route("/register").post(validateUserRegistration, registerForEvent);
eventRouter.route("/get-all-events").get(getEventsWithUsers);
eventRouter.route("/cancel-registration").delete(cancelRegistration);

export default eventRouter;
