const fetchData = require('./fetchData');
const getGroupIDs = require('./groups');

const deptwise = async () => {
    const response = await getGroupIDs();
    const Ids = response.map(element => ({ id: element.id, department: element.name }));

    const promises = Ids.map(async element => {
        const data = await fetchData(element.id);
        return { data, name: element.department };
    });

    const resolvedData = await Promise.all(promises);

    const filteredData = resolvedData.reduce((acc, item) => {
        if (item.data !== null) {
            acc[item.name] = item.data;
        }
        return acc;
    }, {});

    const depts = Object.keys(filteredData)

    return {depts, filteredData}
};

deptwise()
    .then(data => console.log(data.depts))

module.exports = deptwise;