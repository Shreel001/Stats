const getDate = require('./getDate')
const { STATS_URL, CONTENT_URL, INSTITUTION_NAME ,BASIC_AUTHORIZATION_HEADER, BEARER_AUTHORIZATION_TOKEN } = require('./env');
const getGroupIDs = require('./groups');

/* Fetching array of last 6 months from current date */
var xlabels = getDate();

/* Authorization header */
const headers = {
    'Authorization': `Basic ${BASIC_AUTHORIZATION_HEADER}`,
    'Content-Type': 'application/json',
};

/* Function to fetch and cache data */
const fetchData = async (GROUP_ID) => {

    try {
        const [
            response_Views,
            response_Downloads,
            response_TopCountries,
            respose_total_Views,
            response_total_Downloads,
            response_Titles_6
        ] = await Promise.all([
            fetch(`${STATS_URL}/${INSTITUTION_NAME}/timeline/month/views/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`, { headers }),
            fetch(`${STATS_URL}/${INSTITUTION_NAME}/timeline/month/downloads/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`, { headers }),
            fetch(`${STATS_URL}/${INSTITUTION_NAME}/breakdown/total/views/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`, { headers }),
            fetch(`${STATS_URL}/${INSTITUTION_NAME}/timeline/year/views/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`, { headers }),
            fetch(`${STATS_URL}/${INSTITUTION_NAME}/timeline/year/downloads/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`, { headers }),
            fetch(`${CONTENT_URL}/articles?page=1&page_size=1000&published_since=${xlabels[6]}-01&group=${GROUP_ID}`),
        ]); 

        const views_json = await response_Views.json();
        const downloads_json = await response_Downloads.json();
        const topCountries_json = await response_TopCountries.json();
        const totalViews_json = await respose_total_Views.json();
        const totalDownloads_json = await response_total_Downloads.json();
        var responseTitles_json = await response_Titles_6.json();

        if (responseTitles_json.length < 10 ) {
            try {
                const response_Titles_12 = await fetch(`${CONTENT_URL}/articles?page=1&page_size=1000&published_since=${xlabels[0]}-01&group=${GROUP_ID}`)
                var responseTitles_json = await response_Titles_12.json();
            } catch (error) {
                console.error(error)
            }
        }
    
        /* views: Array of views data for past 6 months to display on chart */
        /* downloads: Array of downloads data for past 6 months to display on chart */
        const views = Object.values(views_json.timeline);
        const downloads = Object.values(downloads_json.timeline);
    
        /* Total views and downloads data over past 6 months */
        const resultViews = await totalViews_json.timeline
        const resultDownloads = await totalDownloads_json.timeline
        const totalDownloads = Object.values(resultDownloads).reduce((acc, value) => acc + value, 0);
        const totalViews = Object.values(resultViews).reduce((acc, value) => acc + value, 0);
    
        /* Top ten countries by number of views */
        const result = topCountries_json.breakdown.total
        const countriesData = Object.entries(result)
        const allCountriesViews = countriesData.reduce((arr, [country, countryData]) =>{
            arr[country] = countryData.total;
            return arr
        },[])
    
        /* Filtering country dataset to get top 10 countries with most views */
        const countryNames = Object.entries(allCountriesViews);
        const filteredByViews = countryNames.filter(([key, value]) => key !== 'Unknown'); // Filtering out the Unknown dataset
        const topTen = filteredByViews.slice(0, 10);
        const topCountriesByViews = Object.fromEntries(topTen); // Top ten countries by number of views

        /* Filtering Articles dataset to get top 10 performing articles with most views */
        const viewsByArticleID = responseTitles_json.map(async (element) => {
            const { id, title, url_public_html } = element;
    
            const response = await fetch(`${STATS_URL}/${INSTITUTION_NAME}/total/views/article/${id}`);
            
            if (!response.ok) {
                console.error(`Failed to fetch data for ID ${id}: ${response.statusText}`);
                return { title, views: 0 };
            }
    
            const responseData = await response.json();
            const totalViews = responseData.totals;
    
            return { id: id, title, hyperlink: url_public_html, views: totalViews };
        });
    
        const results = await Promise.all(viewsByArticleID);
        results.sort((a, b) => b.views - a.views);
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
                views: item.views,
                url: item.hyperlink,
                id: item.id,
                author: authorNames
            };
        }));

        const groups = await getGroupIDs()

        // const dropdown = {}
        // const id = groups.map(element => element.id)
        // const department = groups.map(element => element.name)

        var data = { views, downloads, xlabels, topCountriesByViews, totalViews, totalDownloads, topPerformingArticle};
    
        return data;
    } catch (error) {
        return null;
    }
}

module.exports = fetchData;