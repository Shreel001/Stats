require('dotenv').config();
const { BEARER_AUTHORIZATION_TOKEN } = require('./env');

/* Authorization header */
const headers = {
    'Authorization': `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
    'Content-Type': 'application/json',
};

const getGroupIDs = async () => {
    try {
        const response = await fetch(`https://api.figshare.com/v2/account/institution/groups`, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json_response = await response.json();

        const result = json_response.map(article => ({ name: article.name, id: article.id }))

        const faculty = json_response
            .filter(article => article.parent_id == 35349)
            .map(article => ({ name: article.name, id: article.id }));

        const departments = faculty.map(item => {
            if (item.id != 35349) {
                return {
                    name: item.name,
                    id: item.id,
                    departments: json_response
                        .filter(element => element.parent_id === item.id)
                        .map(element => ({ name: element.name, id: element.id }))
                };
            } else {
                return null;
            }
        }).filter(item => item !== null);

        const university = json_response
            .filter(article => article.parent_id == 0 && article.id == 35349)
            .map(article => ({ name: article.name, id: article.id }));

        return {result,departments,university}
    } catch (error) {
        console.error('Error fetching group IDs:', error);
        return null;
    }
};

module.exports = getGroupIDs;