const fetchData = require('./fetchData');
const getGroupIDs = require('./groups');
const fetchCoordinates = require('./getCoordinates')
const {BEARER_AUTHORIZATION_TOKEN} = require('./env')

/* Authorization header */
const headers = {
    'Authorization': `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
    'Content-Type': 'application/json',
};

const deptwise = async () => {
    const response = await getGroupIDs();
    const Ids = response.map(element => ({ id: element.id, department: element.name }));

    const promises = Ids.map(async element => {
        const data = await fetchData(element.id);
        return { data, id: element.id, name: element.department };
    });

    const resolvedData = await Promise.all(promises);

    const nullData = resolvedData.filter(({data}) => data == null)
    const nullDataDepts = nullData.map(element => element.name)

    const filteredData = await resolvedData.reduce((acc, item) => {
        if (item.data !== null) {
            acc[item.name] = item.data;
        }
        return acc;
    }, {});

    try {
        const response = await fetch(`https://api.figshare.com/v2/account/institution/groups`, { headers });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const json_response = await response.json();
  
        const faculty = json_response
            .filter(element => element.parent_id == 35349 || element.parent_id == 0)
            .map(element => ({ name: element.name, id: element.id }));
  
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
  
        // Remove sub-departments present in nullData from each department
        const filteredDepartments = await departments.map(dept => {
            const filteredSubDepartments = dept.departments.filter(subDept =>
                !nullDataDepts.includes(subDept.name)
            );
            return { ...dept, depart: filteredSubDepartments }
        });

        const promises = await filteredDepartments.map(async element => {
            const faculty = element.name;
            const facultyID = element.id;
            const depts = element.depart
            return { faculty, facultyID, depts };
        });
    
        const resolvedData = await Promise.all(promises);

        const coordinates = await fetchCoordinates()
  
        return {coordinates, resolvedData, filteredData};
    } catch (error) {
        console.error('Error fetching group IDs:', error);
    }
}

module.exports = deptwise;