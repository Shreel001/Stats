require('dotenv').config();
const {BEARER_AUTHORIZATION_TOKEN} = require('./env')

/* Authorization header */
const headers = {
    'Authorization': `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
    'Content-Type': 'application/json',
};

const practice = async () => {
    try {
        const response = await fetch(`https://api.figshare.com/v2/account/institution/groups`, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json_response = await response.json();

        const result = json_response.map(element => ({ name: element.name, id: element.id }))

        const faculty = json_response
            .filter(element => element.parent_id == 35349 || element.parent_id == 0) // Exclude specific parent IDs
            .map(element => ({ name: element.name, id: element.id })); // Extract group IDs

        const departments = faculty.map(item => {
          if (item.id != 35349) {
            return {
              name : item.name,
              id : item.id,
              departments: json_response
                  .filter(element => element.parent_id === item.id)
                  .map(element => ({ name: element.name, id: element.id }))
            };
          } else {
            return null;
          }  
        }).filter(item => item !== null);
            
        return departments
    } catch (error) {
        console.error('Error fetching group IDs:', error);
    }
};

module.exports = practice;