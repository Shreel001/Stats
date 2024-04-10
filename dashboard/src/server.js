const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const deptwise = require('./utils/deptWiseData');

const app = express();
app.use(express.static('public'));
app.use(cors());

let serverCache = null;
let isRefreshing = false; // Flag to indicate if cache is being refreshed
let temporaryCache = null; // Temporary cache to serve data while refreshing
const PORT = 8000;

const MAX_RETRY_ATTEMPTS = 3; // Maximum number of retry attempts
const RETRY_INTERVAL_MS = 5000; // Initial retry interval in milliseconds

/* Refresh cache every minute */
cron.schedule('* */2 * * *', async () => {
    console.log('Refreshing cache...');
    let retryAttempts = 0;
    let retryInterval = RETRY_INTERVAL_MS;
    
    while (retryAttempts < MAX_RETRY_ATTEMPTS) {
        try {
            // Set the isRefreshing flag to true while refreshing the cache
            isRefreshing = true;

            // Fetch new data
            const newData = await deptwise();

            // Update the temporary cache with new data
            temporaryCache = { data: newData };

            // Update the server cache with new data
            serverCache = temporaryCache;

            console.log('Cache refreshed successfully.');
            return; // Exit the retry loop if cache refresh succeeds
        } catch (error) {
            console.error('Error refreshing cache:', error);
            retryAttempts++;

            if (retryAttempts < MAX_RETRY_ATTEMPTS) {
                console.log(`Retrying cache refresh in ${retryInterval} ms...`);
                await new Promise(resolve => setTimeout(resolve, retryInterval));
                retryInterval *= 2; // Exponential backoff strategy for retry interval
            }
        } finally {
            // Reset the isRefreshing flag after cache refresh is complete
            isRefreshing = false;
            temporaryCache = null; // Clear the temporary cache
        }
    }

    console.error(`Failed to refresh cache after ${MAX_RETRY_ATTEMPTS} attempts.`);
});

/* Proxy to handle requests */
app.use('/', async (req, res) => {
    if (!serverCache && !temporaryCache) {
        const data = await deptwise();
        serverCache = { data: data };
    }
    // If cache is being refreshed and temporary cache is available, serve data from temporary cache
    if (isRefreshing && temporaryCache) {
        res.json(temporaryCache.data);
    } else if (serverCache) {
        // Serve cached data if available
        res.json(serverCache.data);
    } else {
        // If cache is empty, inform the client
        res.status(404).send('Data not available.');
    }
});

app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
});