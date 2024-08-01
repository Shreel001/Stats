const getDate = require('./getDate');
const { STATS_URL, INSTITUTION_NAME, BASIC_AUTHORIZATION_HEADER } = require('./env');

const xlabels = getDate();

const headers = {
    'Authorization': `Basic ${BASIC_AUTHORIZATION_HEADER}`,
    'Content-Type': 'application/json',
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const logTimestamp = (message) => {
    console.log(`${new Date().toISOString()}: ${message}`);
};

const fetchData = async (GROUP_ID) => {
    try {
        const fetchWithDelay = async (url) => {
            logTimestamp(`Requesting URL: ${url}`);
            const startTime = Date.now();
            const response = await fetch(url, { headers });
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 1000) {
                await delay(1000 - elapsedTime);
            }
            return response.json();
        };

        const urls = [
            `${STATS_URL}/${INSTITUTION_NAME}/timeline/month/views/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`,
            `${STATS_URL}/${INSTITUTION_NAME}/timeline/month/downloads/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`,
            `${STATS_URL}/${INSTITUTION_NAME}/breakdown/total/views/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`,
            `${STATS_URL}/${INSTITUTION_NAME}/timeline/year/views/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`,
            `${STATS_URL}/${INSTITUTION_NAME}/timeline/year/downloads/group/${GROUP_ID}?start_date=${xlabels[6]}-01&end_date=${xlabels[11]}-28`
        ];

        // Fetch data sequentially with delay
        const responses = [];
        for (const url of urls) {
            responses.push(await fetchWithDelay(url));
        }

        const [views_json, downloads_json, topCountries_json, totalViews_json, totalDownloads_json] = responses;

        const views = Object.values(views_json.timeline);
        const downloads = Object.values(downloads_json.timeline);

        const maxLength = Math.max(views.length, downloads.length);
        const paddedViews = [...views, ...Array(maxLength - views.length).fill(0)];
        const paddedDownloads = [...downloads, ...Array(maxLength - downloads.length).fill(0)];

        const totals = paddedViews.map((view, index) => view + paddedDownloads[index]);

        const totalViews = Object.values(totalViews_json.timeline).reduce((acc, value) => acc + value, 0);
        const totalDownloads = Object.values(totalDownloads_json.timeline).reduce((acc, value) => acc + value, 0);

        const allCountriesViews = Object.entries(topCountries_json.breakdown.total)
            .reduce((acc, [country, data]) => {
                if (country !== 'Unknown') {
                    acc[country] = data.total;
                }
                return acc;
            }, {});

        const topCountriesByViews = Object.fromEntries(
            Object.entries(allCountriesViews).slice(0, 25)
        );

        const data = { views, downloads, totals, xlabels, topCountriesByViews, totalViews, totalDownloads };

        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

module.exports = fetchData;
