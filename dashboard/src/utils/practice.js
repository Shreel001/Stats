const views = [1, 2, 3, 4];
const downloads = [1, 2, 3, 4, 5, 6];
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

console.log(tempViews, tempDownloads); // Temporary padded arrays
console.log(views, downloads); // Original arrays remain unchanged
console.log(totals)