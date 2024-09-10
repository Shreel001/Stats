const getDate = require('./getDate');
const { STATS_URL, CONTENT_URL, INSTITUTION_NAME, BASIC_AUTHORIZATION_HEADER, BEARER_AUTHORIZATION_TOKEN } = require('./env');

const xlabels = getDate();

const headers = {
    'Authorization': `Basic ${BASIC_AUTHORIZATION_HEADER}`,
    'Content-Type': 'application/json',
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logTimestamp = (message) => {
    console.log(`${new Date().toISOString()}: ${message}`);
};

const fetchArticles = async (GROUP_ID) => {
    try {
        const fetchArticlesData = async (url) => {
            logTimestamp(`Requesting URL: ${url}`);
            const startTime = Date.now();
            const response = await fetch(url);
            const data = await response.json();
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 1000) {
                await delay(1000 - elapsedTime);
            }
            return data;
        };

        const urls = [
            `${CONTENT_URL}/articles?page=1&page_size=1000&published_since=${xlabels[6]}-01&group=${GROUP_ID}`,
            `${CONTENT_URL}/articles?page=1&page_size=1000&published_since=${xlabels[0]}-01&group=${GROUP_ID}`
        ];

        let responseTitles_json = await fetchArticlesData(urls[0]);

        if (responseTitles_json.length < 10) {
            responseTitles_json = await fetchArticlesData(urls[1]);
        }

        const fetchViewsData = async (element) => {
            const { id, title, url_public_html } = element;
            const url = `${STATS_URL}/${INSTITUTION_NAME}/total/article/${id}`;
            logTimestamp(`Requesting URL: ${url}`);
            const startTime = Date.now();
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Failed to fetch data for ID ${id}: ${response.statusText}`);
                return { id, title, hyperlink: url_public_html, totalData: 0 };
            }
            const responseData = await response.json();
            const totalData = responseData.views + responseData.downloads;
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 1000) {
                await delay(1000 - elapsedTime);
            }
            return { id, title, hyperlink: url_public_html, totalData };
        };

        const viewsByArticleID = [];
        for (const element of responseTitles_json) {
            viewsByArticleID.push(await fetchViewsData(element));
        }

        viewsByArticleID.sort((a, b) => b.totalData - a.totalData);
        const topTenArticles = viewsByArticleID.slice(0, 10);

        const fetchAuthorsData = async (item) => {
            const url = `${CONTENT_URL}/account/articles/${item.id}/authors`;
            logTimestamp(`Requesting URL: ${url}`);
            const startTime = Date.now();
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            const authors = await response.json();
            const authorNames = authors.map(author => author.full_name);
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 1000) {
                await delay(1000 - elapsedTime);
            }
            return {
                title: item.title,
                views: item.totalData,
                url: item.hyperlink,
                id: item.id,
                author: authorNames
            };
        };

        const topPerformingArticle = [];
        for (const item of topTenArticles) {
            topPerformingArticle.push(await fetchAuthorsData(item));
        }

        return { topPerformingArticle };
    } catch (error) {
        console.error("Error fetching articles:", error);
        return null;
    }
};

module.exports = fetchArticles;
