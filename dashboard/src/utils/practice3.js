const getDate = require('./getDate')
const getGroupIDs = require('./groups');
const { STATS_URL, INSTITUTION_NAME ,BASIC_AUTHORIZATION_HEADER } = require('./env');

/* Fetching array of last 6 months from current date */
var xlabels = getDate();

/* Authorization header */
const headers = {
    'Authorization': `Basic ${BASIC_AUTHORIZATION_HEADER}`,
    'Content-Type': 'application/json',
};

const depts = async () => {
    const deptID = await getGroupIDs();
    const Ids = deptID.map(element => ({ id: element.id, department: element.name }));

    const promises = Ids.map(async element => {
        const views = await fetch(`${STATS_URL}/${INSTITUTION_NAME}/timeline/month/views/group/${element.id}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`, { headers })
        const response = await views.json()
        const data = await response.timeline
        return { data, name: element.department };
    });

    const resolvedData = await Promise.all(promises);

    const filteredData = resolvedData.reduce((acc, item) => {
        if (item.data !== null ) {
            acc[item.name] = item.data;
        }
        return acc;
    }, {});    

    const depts = Object.keys(filteredData)

    return filteredData
};

// depts()
//     .then(data => console.log(data))

module.exports = depts;