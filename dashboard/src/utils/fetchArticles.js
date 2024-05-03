const getDate = require('./getDate')
const { STATS_URL, CONTENT_URL, INSTITUTION_NAME , BASIC_AUTHORIZATION_HEADER, BEARER_AUTHORIZATION_TOKEN } = require('./env');

/* Fetching array of last 6 months from current date */
var xlabels = getDate();

/* Authorization header */
const headers = {
    'Authorization': `Basic ${BASIC_AUTHORIZATION_HEADER}`,
    'Content-Type': 'application/json',
};

/* Function to fetch and cache data */
const fetchArticles = async (GROUP_ID) => {

    try {
        let responseTitles_json;

        // Attempt fetching with a maximum of 3 retries
        const response_Titles_6 = await fetch(`${CONTENT_URL}/articles?page=1&page_size=1000&published_since=${xlabels[6]}-01&group=${GROUP_ID}`);
        responseTitles_json = await response_Titles_6.json();

        if (responseTitles_json.length < 10) {
            const response_Titles_12 = await fetch(`${CONTENT_URL}/articles?page=1&page_size=1000&published_since=${xlabels[0]}-01&group=${GROUP_ID}`);
            responseTitles_json = await response_Titles_12.json();
        }
    
        /* Filtering Articles dataset to get top 10 performing articles with most views */
        const viewsByArticleID = responseTitles_json.map(async (element) => {
            const { id, title, url_public_html } = element;
    
            const response = await fetch(`${STATS_URL}/${INSTITUTION_NAME}/total/article/${id}`);
            
            if (!response.ok) {
                console.error(`Failed to fetch data for ID ${id}: ${response.statusText}`);
                return { title, views: 0 };
            }
    
            const responseData = await response.json();
            const totalViews = responseData.views;
            const totalDownloads = responseData.downloads;
            const totalData = totalViews + totalDownloads;
    
            return { id: id, title, hyperlink: url_public_html, totalData: totalData };
        });
    
        const results = await Promise.all(viewsByArticleID);
        results.sort((a, b) => b.totalData - a.totalData);
        const topTenArticles = results.slice(0, 10);
    
        const topPerformingArticle = await Promise.all(topTenArticles.map(async (item) => {
            const response = await fetch(`${CONTENT_URL}/account/articles/${item.id}/authors`, {
                headers: {
                    'Authorization': `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            const authors = await response.json();
            const authorNames = authors.map(author => author.full_name);
            
            return {
                title: item.title,
                views: item.totalData,
                url: item.hyperlink,
                id: item.id,
                author: authorNames
            };
        }));

        var data = { topPerformingArticle };
    
        return data;
    } catch (error) {
        return null;
    }
}

module.exports = fetchArticles;