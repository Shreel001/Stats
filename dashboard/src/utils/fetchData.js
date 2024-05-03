const getDate = require('./getDate')
const { STATS_URL, INSTITUTION_NAME ,BASIC_AUTHORIZATION_HEADER } = require('./env');

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
            response_total_Downloads
        ] = await Promise.all([
            fetch(`${STATS_URL}/${INSTITUTION_NAME}/timeline/month/views/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`, { headers }),
            fetch(`${STATS_URL}/${INSTITUTION_NAME}/timeline/month/downloads/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`, { headers }),
            fetch(`${STATS_URL}/${INSTITUTION_NAME}/breakdown/total/views/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`, { headers }),
            fetch(`${STATS_URL}/${INSTITUTION_NAME}/timeline/year/views/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`, { headers }),
            fetch(`${STATS_URL}/${INSTITUTION_NAME}/timeline/year/downloads/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`, { headers })
        ]); 

        const views_json = await response_Views.json();
        const downloads_json = await response_Downloads.json();
        const topCountries_json = await response_TopCountries.json();
        const totalViews_json = await respose_total_Views.json();
        const totalDownloads_json = await response_total_Downloads.json();
    
        /* views: Array of views data for past 6 months to display on chart */
        /* downloads: Array of downloads data for past 6 months to display on chart */
        const views = Object.values(views_json.timeline);
        const downloads = Object.values(downloads_json.timeline);

        const tempViews = [...views]; // Create a copy of views array
        const tempDownloads = [...downloads]; // Create a copy of downloads array
        
        const maxLength = Math.max(tempViews.length, tempDownloads.length);
        
        // Pad views array with zeros if it's shorter
        while (tempViews.length < maxLength) {
            tempViews.push(0);
        }
        
        // Pad downloads array with zeros if it's shorter
        while (tempDownloads.length < maxLength) {
            tempDownloads.push(0);
        }
        
        let totals = [];
        for(i=0; i < maxLength; i++){
            totals[i] = tempViews[i] + tempDownloads[i]
        }
    
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
        const topTen = filteredByViews.slice(0, 25);
        const topCountriesByViews = Object.fromEntries(topTen); // Top ten countries by number of views

        var data = { views, downloads, totals, xlabels, topCountriesByViews, totalViews, totalDownloads };
    
        return data;
    } catch (error) {
        return null;
    }
}

module.exports = fetchData;