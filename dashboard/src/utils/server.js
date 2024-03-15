const express = require('express');
const cors = require('cors');
const practice = require('./practice');
const getGroupIDs = require('./groups');

const app = express();
app.use(express.static('public'));
app.use(cors());

const PORT = 8000

/* Proxy to handle requests */
app.use('/', async (req, res) => {
    const data = await getGroupIDs()
    res.json(data)
});

app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
});