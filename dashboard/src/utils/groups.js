const cron = require('node-cron');
const { CONTENT_URL, BEARER_AUTHORIZATION_TOKEN } = require('./env');

/* Authorization header */
const headers = {
    'Authorization': `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
    'Content-Type': 'application/json',
};

let cachedGroupIDs;

const fetchGroupIDs = async () => {
    try {
        const response = await fetch(`${CONTENT_URL}/account/institution/groups`, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json_response = await response.json();

        const result = json_response.map(article => ({ name: article.name, id: article.id }));

        const faculty = json_response
            .filter(article => article.parent_id == 35349)
            .map(article => ({ name: article.name, id: article.id }));

        const departments = faculty.map(item => {
            if (item.id != 35349) {
                return {
                    name: item.name,
                    departments: json_response
                        .filter(element => element.parent_id === item.id)
                        .map(element => ({ name: element.name }))
                };
            } else {
                return null;
            }
        }).filter(item => item !== null);

        const university = json_response
            .filter(article => article.parent_id == 0 && article.id == 35349)
            .map(article => ({ name: article.name }));

        return { result, departments, university };
    } catch (error) {
        console.error('Error fetching group IDs:', error);
        throw error; // Rethrow the error to handle it outside
    }
};

cron.schedule('0 0 1 * *', async () => {
    try {
        // Fetch group IDs and update cachedGroupIDs
        const newData = await fetchGroupIDs();
        cachedGroupIDs = newData;
        console.log('Data refreshed:', newData);
        return cachedGroupIDs;
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
});

const getGroupIDs = async () => {

    if(!cachedGroupIDs){
        const data = await fetchGroupIDs()
        cachedGroupIDs = data;
        return cachedGroupIDs;
    }else{
        return cachedGroupIDs
    }
}

module.exports = getGroupIDs;