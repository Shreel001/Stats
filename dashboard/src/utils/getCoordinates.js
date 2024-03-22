const fs = require("fs");
const { parse } = require("csv-parse");

const fetchCoordinates = () => {

    return new Promise((resolve, reject) => {
        const geoJsonData = {
            type: "FeatureCollection",
            features: []
          };

        // Read the CSV file
        fs.createReadStream("./countries.csv")
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
            // Extract latitude, longitude, and country name from the row
            const latitude = row[1];
            const longitude = row[2];
            const countryName = row[3];

            if (latitude && longitude && countryName) {
                const feature = {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [latitude, longitude] // Google returns coordinates as {lat, lng}, GeoJSON expects [lng, lat]
                  },
                  properties: {
                    name: countryName
                  }
                };
                geoJsonData.features.push(feature);
              }
        })
        .on("end", function () {
            // Resolve the promise with the countriesData array
            resolve(geoJsonData);
        })
        .on("error", function (error) {
            // Reject the promise with the error
            reject(error);
        });
    });
}

// fetchCoordinates()
//     .then(data => console.log(data.features))
//     .catch(error => console.error(error));

module.exports = fetchCoordinates;