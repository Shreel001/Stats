const express = require('express');
const cors = require('cors');
const practice = require("./practice");

const app = express();
app.use(express.static('public'));
app.use(cors());

const PORT = 5000

const deptwise = async () => {
    const deptID = await practice()
    const promises = deptID.map(async element => {
        const faculty = element.name;
        const facultyID = element.id;
        const depts = element.departments
        return { faculty, facultyID, depts };
    });
    
    const resolvedData = await Promise.all(promises);
    
    return resolvedData;
};

/* Proxy to handle requests */
app.use('/', async (req, res) => {
    const data = await deptwise()
    res.json(data)
});

app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
});

module.exports = deptwise;