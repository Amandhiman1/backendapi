/**
 * Function to replace city names with their Spanish translations if available in the city table.
 * @param {Object} flightData - The nested flight data object.
 * @param {Array} cityTable - The array of city translation objects.
 * @returns {Object} - The updated flight data object with Spanish city names.
 */
function replaceCityNamesWithSpanish(flightData, cityTable) {
    // Convert cityTable into a lookup object for faster access
    const cityLookup = {};
    cityTable.forEach(city => {
        if (city.english && city.spanish) {
            cityLookup[city.english] = city.spanish;
        }
    });

    // Recursive function to traverse the flightData and replace CityName values
    function replaceCityName(data) {
        if (Array.isArray(data)) {
            return data.map(item => replaceCityName(item));
        } else if (typeof data === 'object' && data !== null) {
            for (let key in data) {
                if (key === 'CityName' && cityLookup[data[key]]) {
                    // Replace the city name with the Spanish translation if available
                    data[key] = cityLookup[data[key]];
                }
                // Recursively process nested objects/arrays
                if (typeof data[key] === 'object') {
                    data[key] = replaceCityName(data[key]);
                }
            }
        }
        return data;
    }

    // Call the replaceCityName function on the flightData
    return replaceCityName(flightData);
}

// Example flightData
const flightData = {
    "flights": [
        {
            "_id": "65fd437324aa19d9bc4dff79",
            "Flight": {
                "FlightDetails": {
                    "Details": [
                        [
                            {
                                "Origin": {
                                    "AirportCode": "DEL",
                                    "CityName": "Delhi",
                                    "AirportName": "Delhi",
                                    "DateTime": "2024-10-28 20:15:00"
                                },
                                "Destination": {
                                    "AirportCode": "BOM",
                                    "CityName": "Mumbai",
                                    "AirportName": "Mumbai",
                                    "DateTime": "2024-10-28 22:30:00"
                                }
                            }
                        ]
                    ]
                }
            },
            "Origin": {
                "AirportCode": "DEL",
                "CityName": "Delhi",
                "AirportName": "Delhi",
                "DateTime": "2024-10-28 20:15:00"
            },
            "Destination": {
                "AirportCode": "BOM",
                "CityName": "Mumbai",
                "AirportName": "Mumbai",
                "DateTime": "2024-10-28 22:30:00"
            }
        }
    ],
    "queryString": {
        "Origin.CityName": "Delhi",
        "Destination.CityName": "Mumbai"
    }
};

// Example city translation table
const cityTable = [
    { "city_code": "DEL", "english": "Delhi", "spanish": "Nueva Delhi" },
    { "city_code": "BOM", "english": "Mumbai", "spanish": "Bombay" }
];

// Replace city names with their Spanish translations
const updatedFlightData = replaceCityNamesWithSpanish(flightData, cityTable);

console.log(JSON.stringify(updatedFlightData));
