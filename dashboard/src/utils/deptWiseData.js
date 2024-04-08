const fetchData = require('./fetchData');
const getGroupIDs = require('./groups');

const deptwise = async () => {
    const response = await getGroupIDs();
    const Ids = response.result.map(element => ({ id: element.id, department: element.name }));

    const promises = Ids.map(async element => {
        const data = await fetchData(element.id);
        return {id: element.id, name: element.department, data };
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

    // Remove sub-departments present in nullData from each department
    const filteredDepartments = await response.departments.map(dept => {
        const filteredSubDepartments = dept.departments.filter(subDept =>
            !nullDataDepts.includes(subDept.name)
        );
        return { ...dept, depart: filteredSubDepartments }
    });

    const deptData = await filteredDepartments.map(async element => {
        const faculty = element.name;
        const facultyID = element.id;
        const depts = element.depart
        return { faculty, facultyID, depts };
    });

    const deptList = await Promise.all(deptData);

    const university = response.university

    return {university, deptList, filteredData};
}

module.exports = deptwise;