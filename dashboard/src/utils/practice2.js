const express = require('express');
const cors = require('cors');
const practice = require("./practice");

const app = express();
app.use(express.static('public'));
app.use(cors());

const PORT = 5000

const deptwise = async () => {
    const deptID = await practice()
    const departments = await deptID.departments
    const promises = departments.map(async element => {
        const faculty = element.name;
        const facultyID = element.id;
        const depts = element.departments
        return { faculty, facultyID, depts };
    });
    
    const resolvedData = await Promise.all(promises);
    
    return resolvedData;
};

let serverCache = null;

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

module.exports = deptwise;