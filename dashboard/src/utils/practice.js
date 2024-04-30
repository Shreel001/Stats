const deptwise = require("./deptWiseData");

const missingArticles = async () => {

    mergedDataset = {}
    const data = await deptwise();
    const primaryDataset = data.primaryData;
    const university = data.university;
    const deptList = data.deptList; 
    const nullArticleDeptsLength = data.nullArticleDeptsLength
    const nullArticleDepts = data.nullArticleDepts

    const promises = nullArticleDepts.map(async element => {
        const primaryData = await fetchData(element.id);
        const articles = await fetchArticle(element.id)
        const data = {primaryData, articles}
        return {name: element.department, id: element.id, data };
    });

    const resolvedData = await Promise.all(promises);
    
    const secondaryDataset = resolvedData.reduce((acc, item) => {
        if (item.data.primaryData !== null && item.data.articles !== null) {
            acc[item.name] = {
                id: item.id,
                primaryData: item.data.primaryData,
                articles: item.data.articles
            };
        }
        return acc;
    }, {});

    mergedDataset = { ...primaryDataset, ...secondaryDataset };

    const len = Object.keys(mergedDataset).length

    return {university, deptList, mergedDataset, nullArticleDepts, nullArticleDeptsLength, len}
}

module.exports = missingArticles;