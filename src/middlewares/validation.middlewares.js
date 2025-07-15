import pool from "../connections/connection.db.js";

const validateUserRegistration = async (req, res, next) => {
  try {
    const { event_id, name, email } = req.body || {};

    // 1. Validate required fields
    if (!event_id || !name || !email) {
      return res.status(400).json({
        error: "All fields are required",
        missing_fields: {
          event_id: !event_id,
          name: !name,
          email: !email
        }
      });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        example: "user@example.com"
      });
    }

    // 3. Get complete event data
    const event = await pool.query(
      `SELECT id, date_time, capacity, registrations 
       FROM events WHERE id = $1`,
      [event_id]
    );

    if (event.rows.length === 0) {
      return res.status(404).json({ 
        error: "Event not found",
        event_id
      });
    }

    const eventData = event.rows[0];

    // 4. Check if event is in the past
    if (new Date(eventData.date_time) < new Date()) {
      return res.status(400).json({ 
        error: "Event has already concluded",
        status: "completed"
      });
    }

    // 5. Check event capacity
    if (eventData.registrations >= eventData.capacity) {
      return res.status(400).json({
        error: "Event is at full capacity",
        capacity: eventData.capacity,
        current_registrations: eventData.registrations,
        available: false
      });
    }

    // 6. Check for duplicate registration
    const existingRegistration = await pool.query(
      `SELECT 1 FROM users WHERE email = $1 AND event_id = $2`,
      [email, event_id]
    );

    if (existingRegistration.rows.length > 0) {
      return res.status(409).json({ 
        error: "Email already registered for this event",
        email
      });
    }

    // Attach event data for controller
    req.eventData = eventData;
    next();
  } catch (err) {
    console.error("Validation error:", err);
    res.status(500).json({ 
      error: "Validation failed",
      details: err.message 
    });
  }
};

const validateEvent = (req, res, next) => {
  const { id, title, dateTime, location, capacity } = req.body || {};

  if (!id || !title || !dateTime || !location || capacity == null) {
    return res.status(400).json({ error: "All event fields are required." });
  }

  const isoDate = new Date(dateTime);
  if (isNaN(isoDate.getTime())) {
    return res
      .status(400)
      .json({ error: "Invalid date/time format (must be ISO)." });
  }

  if (typeof capacity !== "number" || capacity <= 0 || capacity > 1000) {
    return res
      .status(400)
      .json({ error: "Capacity must be between 1 and 1000." });
  }

  next();
};

export { validateUserRegistration, validateEvent };
