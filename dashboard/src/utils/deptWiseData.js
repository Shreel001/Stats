const fetchData = require('./fetchData');
const getGroupIDs = require('./groups');
const fetchArticle = require('./fetchArticles')

const deptwise = async () => {
    const response = await getGroupIDs();
    const Ids = await response.result.map(element => ({ id: element.id, department: element.name }));

    const promises = Ids.map(async element => {
        const primaryData = await fetchData(element.id);
        const articles = await fetchArticle(element.id)
        const data = {primaryData, articles}
        return {name: element.department, id: element.id, data };
    });

    const resolvedData = await Promise.all(promises);

    const nullArticleData = resolvedData.filter(({data}) => data.articles == null)
    const nullArticleDepts = nullArticleData.map(element => ({id: element.id, department: element.name}))
    const nullArticleDeptsLength = nullArticleDepts.length

    const nullData = resolvedData.filter(({data}) => data.primaryData == null)
    const nullDataDepts = nullData.map(element => element.name)
    const nullDepts = nullDataDepts.length

    const primaryData = resolvedData.reduce((acc, item) => {
        if (item.data.primaryData !== null && item.data.articles !== null) {
            acc[item.name] = {
                id: item.id,
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

    return { university, deptList, primaryData, nullArticleDepts, nullArticleDeptsLength};
}

module.exports = deptwise;