import { Router } from "express";
import {
  createEvent,
  registerForEvent,
  getEventsWithUsers,
  cancelRegistration,
  upcomingEvents,
  eventStats
} from "../controllers/events.controller.js";
import {
  validateEvent,
  validateUserRegistration,
} from "../middlewares/validation.middlewares.js";

const eventRouter = Router();

eventRouter.route("/create").post(validateEvent, createEvent);
eventRouter.route("/register").post(validateUserRegistration, registerForEvent);
eventRouter.route("/get-all-events").get(getEventsWithUsers);
eventRouter.route("/:event_id/user/:email").delete(cancelRegistration);
eventRouter.route("/upcoming").get(upcomingEvents);
eventRouter.route("/stat/:event_id").get(eventStats);

export default eventRouter;
