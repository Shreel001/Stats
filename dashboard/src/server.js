const express = require('express');
const cors = require('cors');
const deptwise = require('./utils/deptWiseData');

const app = express();
app.use(express.static('public'));
app.use(cors());

let serverCache = null;
const PORT = 8000

/* Proxy to handle requests */
app.use('/', async (req, res) => {
    /* checking for the cached data on server side */
    if (serverCache && Date.now() - serverCache.timestamp < 15 * 60 * 1000) {
        res.json(serverCache.data);
    } else {
        try {
            /* Fetch and cache data */
            var data = await deptwise();
            serverCache = {
                data: data,
                timestamp: Date.now(),
            };
            res.json(data);
        } catch (error) {
            console.error('Error during API request:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
});