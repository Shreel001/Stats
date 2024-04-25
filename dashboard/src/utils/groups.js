require('dotenv').config();
const { BEARER_AUTHORIZATION_TOKEN } = require('./env');

/* Authorization header */
const headers = {
    'Authorization': `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
    'Content-Type': 'application/json',
};

let cachedData = null;
let lastCacheTimestamp = 0;
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

const getGroupIDs = async () => {
    try {

        if (cachedData && Date.now() - lastCacheTimestamp < CACHE_DURATION) {
            return cachedData;
        }

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

        const data = {result,departments,university}

        // Cache the fetched data
        cachedData = data;
        lastCacheTimestamp = Date.now();

        return data;
    } catch (error) {
        console.error('Error fetching group IDs:', error);
        return null;
    }
};

module.exports = getGroupIDs;