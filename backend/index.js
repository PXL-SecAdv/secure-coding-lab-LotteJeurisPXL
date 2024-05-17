const pg = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();

const port = 3000;

const pool = new pg.Pool({
    user: 'secadv',
    host: 'db',
    database: 'pxldb',
    password: 'ilovesecurity',
    port: 5432,
    connectionTimeoutMillis: 5000
});

// Define CORS options
const corsOptions = {
  origin: 'http://localhost:8081', // Allow requests from this origin
  methods: ['GET'], // Allow only GET requests
};


console.log("Connecting...:");

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// Validate username and password using regex patterns
const validateUsername = (username) => {
    // allow letters, numbers, underscore, and : , ; ? ! -
    const usernamePattern = /^[\w:.,;?!-]+$/;
    return usernamePattern.test(username);
};

const validatePassword = (password) => {
    // allow letters, numbers, underscore, and : , ; ? ! -
    const passwordPattern = /^[\w:.,;?!-]+$/;
    return passwordPattern.test(password);
};

app.get('/authenticate/:username/:password', async (request, response) => {
    const username = request.params.username;
    const password = request.params.password;

    // validate username and password to match pattern
    if (!validateUsername(username) || !validatePassword(password)) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Retrieve the hashed password from the database based on the provided username
        const query = 'SELECT password FROM users WHERE user_name = $1';
        const result = await pool.query(query, [username]);

        // If no user found, return unauthorized
        if (result.rows.length === 0) {
            return response.status(401).json({ error: 'Unauthorized' });
        }

        // Compare the hashed password with the provided password using bcrypt
        const hashedPasswordFromDb = result.rows[0].password;
        const isPasswordCorrect = await bcrypt.compare(password, hashedPasswordFromDb);

        // If passwords match, authentication successful
        if (isPasswordCorrect) {
            return response.status(200).json({ message: 'Authentication successful' });
        } else {
            // If passwords don't match, return unauthorized
            return response.status(401).json({ error: 'Unauthorized' });
        }
    } catch (error) {
        console.error('Error executing query', error.stack);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
