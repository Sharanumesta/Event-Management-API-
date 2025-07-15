import pool from "../connections/connection.db.js";

const createEvent = async (req, res) => {
  try {
    const { id, title, dateTime, location, capacity } = req.body;

    if (!id || !title || !dateTime || !location || capacity == null) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const checkQuery = `SELECT id FROM events WHERE id = $1`;
    const existingEvent = await pool.query(checkQuery, [id]);

    if (existingEvent.rows.length > 0) {
      return res.status(409).json({
        error: "Event with this ID already exists",
        existing_event_id: id,
      });
    }

    const insertQuery = `
      INSERT INTO events (id, title, date_time, location, capacity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      id,
      title,
      dateTime,
      location,
      capacity,
    ]);

    res.status(201).json({
      message: "Event created successfully",
      event: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating event:", err);

    if (err.code === "23505") {
      // PostgreSQL unique violation error code
      return res.status(409).json({
        error: "Event with this ID already exists",
        details: err.detail,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
};

const getEventsWithUsers = async (req, res) => {
  try {
    const eventsResult = await pool.query(
      "SELECT * FROM events ORDER BY date_time"
    );

    const eventsWithUsers = await Promise.all(
      eventsResult.rows.map(async (event) => {
        const usersResult = await pool.query(
          `
          SELECT name, email
          FROM users
          WHERE event_id = $1
          `,
          [event.id]
        );

        return {
          ...event,
          registered_users: usersResult.rows,
        };
      })
    );

    res.status(200).json({
      count: eventsWithUsers.length,
      events: eventsWithUsers,
    });
  } catch (err) {
    console.error("Error fetching events with users:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const { event_id, name, email } = req.body;
    const { capacity, registrations } = req.eventData;

    // 1. Register user
    const registration = await pool.query(
      `INSERT INTO users (event_id, name, email)
       VALUES ($1, $2, $3)
       RETURNING event_id, name, email`,
      [event_id, name, email]
    );

    // 2. Update registration count
    await pool.query(
      `UPDATE events 
       SET registrations = registrations + 1 
       WHERE id = $1`,
      [event_id]
    );

    res.status(201).json({
      success: true,
      registration: registration.rows[0],
      remaining_capacity: capacity - registrations - 1,
      message: "Successfully registered for event",
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      error: "Registration processing failed",
      details: err.message,
    });
  }
};

const cancelRegistration = async (req, res) => {
  const { event_id, email } = req.body;

  if (!event_id || typeof event_id !== "string" || event_id.trim() === "") {
    return res.status(400).json({ error: "Invalid or missing event_id." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid or missing email." });
  }

  try {
    const userCheck = await pool.query(
      `SELECT * FROM users WHERE event_id = $1 AND email = $2`,
      [event_id, email]
    );

    if (userCheck.rowCount === 0) {
      return res.status(404).json({ error: "User is not registered for this event." });
    }

    await pool.query(
      `DELETE FROM users WHERE event_id = $1 AND email = $2`,
      [event_id, email]
    );

    await pool.query(
      `UPDATE events SET registrations = registrations - 1 WHERE id = $1`,
      [event_id]
    );

    return res.status(200).json({ message: "Registration cancelled successfully." });

  } catch (err) {
    console.error("Error cancelling registration:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export {
  createEvent,
  getEventsWithUsers,
  registerForEvent,
  cancelRegistration,
};
