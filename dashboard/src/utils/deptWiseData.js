const fetchData = require('./fetchData');
const getGroupIDs = require('./groups');
const fetchArticle = require('./fetchArticles')

const deptwise = async () => {
    const response = await getGroupIDs();
    const Ids = response.result.map(element => ({ id: element.id, department: element.name }));

    const promises = Ids.map(async element => {
        const primaryData = await fetchData(element.id);
        const articles = await fetchArticle(element.id)
        const data = {primaryData, articles}
        return {name: element.department, data };
    });

    const resolvedData = await Promise.all(promises);

    const nullData = resolvedData.filter(({data}) => data.primaryData == null)
    const nullDataDepts = nullData.map(element => element.name)
    const nullDepts = nullDataDepts.length

    const filteredData = resolvedData.reduce((acc, item) => {
        if (item.data.primaryData !== null) {
            acc[item.name] = {
                primaryData: item.data.primaryData,
                articles: item.data.articles
            };
        }
        return acc;
    }, {});    

    // Remove sub-departments present in nullData from each faculty
    const filteredDepartments = await response.departments.map(dept => {
        const filteredSubDepartments = dept.departments.filter(subDept =>
            !nullDataDepts.includes(subDept.name)
        );
        return { ...dept, depart: filteredSubDepartments }
    });

    const deptData = await filteredDepartments.map(async element => {
        const faculty = element.name;
        const depts = element.depart
        return { faculty, depts };
    });

    const deptList = await Promise.all(deptData);

    const university = response.university

    return {university, deptList, filteredData, nullDepts, nullDataDepts, nullDepts};
}

module.exports = deptwise;