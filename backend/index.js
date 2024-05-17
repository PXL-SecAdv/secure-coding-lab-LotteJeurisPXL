const pg = require('pg');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')

const port = 3000;

const pool = new pg.Pool({
    user: 'secadv',
    host: 'db',
    database: 'pxldb',
    password: 'ilovesecurity',
    port: 5432,
    connectionTimeoutMillis: 5000
})

console.log("Connecting...:")

app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

// Validate username and password using regex patterns
const validateUsername = (username) => {
  // allow letters, numbers, underscore, and : , ; ? ! -
  const usernamePattern = /^[\w:.,;?!-]+$/
  return usernamePattern.test(username)
}

const validatePassword = (password) => {
  // allow letters, numbers, underscore, and : , ; ? ! -
  const passwordPattern = /^[\w:.,;?!-]+$/
  return passwordPattern.test(password)
}

app.get('/authenticate/:username/:password', async (request, response) => {
    const username = request.params.username;
    const password = request.params.password;

    // validate username and password to match pattern
    if (!validateUsername(username) || !validatePassword(password)) {
      return response.status(401).json({ error: 'Unauthorized' });
    }


    // Use a parameterized query to prevent SQL injection
    const query = 'SELECT * FROM users WHERE user_name = $1 AND password = $2';
    const values = [username, password];

    try {
        const results = await pool.query(query, values);
        response.status(200).json(results.rows);
    } catch (error) {
        console.error('Error executing query', error.stack);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
