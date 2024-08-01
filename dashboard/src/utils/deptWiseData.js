const fetchData = require('./fetchData');
const getGroupIDs = require('./groups');
const fetchArticle = require('./fetchArticles');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const deptwise = async () => {
    const response = await getGroupIDs();
    const Ids = await response.result.map(element => ({ id: element.id, department: element.name }));

    const results = [];
    
    for (const element of Ids) {

        // Fetch primary data
        const primaryData = await fetchData(element.id);

        // Introduce delay
        await delay(1000);

        // Fetch articles
        const articles = await fetchArticle(element.id);

        // Combine data
        const data = { primaryData, articles };
        results.push({ name: element.department, id: element.id, data });
    }

    const nullArticleData = results.filter(({data}) => data.articles == null)
    const nullArticleDepts = nullArticleData.map(element => ({id: element.id, department: element.name}))
    const nullArticleDeptsLength = nullArticleDepts.length

    const nullData = results.filter(({data}) => data.primaryData == null)
    const nullDataDepts = nullData.map(element => element.name)
    const nullDepts = nullDataDepts.length

    const primaryData = results.reduce((acc, item) => {
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