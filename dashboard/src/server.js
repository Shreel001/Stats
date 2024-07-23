const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const missingArticles = require('./utils/missingArticles');

const app = express();
app.use(express.static('public'));
app.use(cors());

let serverCache = null;
let isRefreshing = false; // Flag to indicate if cache is being refreshed
let temporaryCache = null; // Temporary cache to serve data while refreshing
const PORT = 8000;

/* Refresh cache every 8 hour */
cron.schedule('* */8 * * *', async () => {
    console.log('Refreshing cache...');
    
    try {
        // Set the isRefreshing flag to true while refreshing the cache
        isRefreshing = true;

        // Fetch new data
        const newData = await missingArticles();

        // Update the temporary cache with new data
        temporaryCache = { data: newData };

        // Update the server cache with new data
        serverCache = temporaryCache;

        console.log('Cache refreshed successfully.');
        return; // Exit the retry loop if cache refresh succeeds
    } catch (error) {
        console.error('Error refreshing cache:', error);
    } finally {
        // Reset the isRefreshing flag after cache refresh is complete
        isRefreshing = false;
        temporaryCache = null; // Clear the temporary cache
    }
});

/* Proxy to handle requests */
app.use('/', async (req, res) => {
    if (!serverCache && !temporaryCache) {
        const data = await missingArticles();
        
        serverCache = { data: data };
    }
    // If cache is being refreshed and temporary cache is available, serve data from temporary cache
    if (isRefreshing && temporaryCache) {
        res.json(temporaryCache.data);
    } else if (serverCache) {
        // Server cached data if available
        res.json(serverCache.data);
    } else {
        // If cache is empty, inform the client
        res.status(404).send('Data not available.');
    }
});

app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
});