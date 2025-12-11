const { sql } = require('../config/db');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM Events ORDER BY EventDate ASC');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    try {
        const { title, description, eventDate, zoomLink } = req.body;

        if (!title || !eventDate) {
            return res.status(400).json({ msg: 'Please provide title and date' });
        }

        const pool = await sql.connect();
        await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Description', sql.NVarChar, description)
            .input('EventDate', sql.DateTime, eventDate)
            .input('ZoomLink', sql.NVarChar, zoomLink)
            .query(`
                INSERT INTO Events (Title, Description, EventDate, ZoomLink)
                VALUES (@Title, @Description, @EventDate, @ZoomLink)
            `);

        res.status(201).json({ msg: 'Event created' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Events WHERE EventID = @id');

        res.json({ msg: 'Event deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getEvents, createEvent, deleteEvent };
