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
            .filter(article => article.parent_id == 35349 || article.parent_id == 0) // Exclude specific parent IDs
            .map(article => ({ name: article.name, id: article.id })); // Extract group IDs

        const department = json_response
            .filter(article => article.parent_id !== 35349 && article.parent_id !== 0) // Exclude specific parent IDs
            .map(article => ({ name: article.name, id: article.id })); // Extract group IDs

        return result
    } catch (error) {
        console.error('Error fetching group IDs:', error);
        return null;
    }
};

module.exports = getGroupIDs;