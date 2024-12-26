class FlightService {
    /**
     * Step 1: Fetch flight data (Mocked as an example)
     * @returns {Object} - The flight data object
     */
    static getFlightData() {
        return {
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
    }

    /**
     * Step 2: Fetch required replacement keys (CityName, AirportName)
     * @returns {Array} - The array of replacement keys to search in the flight data
     */
    static getReplacementRequiredKeys() {
        return ["CityName", "AirportName"];
    }

    /**
     * Step 3a: Fetch the city translation table (city data)
     * @returns {Array} - The array of city objects containing translations
     */
    static getCityTranslationTable() {
        return [
            { "city_code": "DEL", "english": "Delhi", "spanish": "Nueva Delhi" },
            { "city_code": "BOM", "english": "Mumbai", "spanish": "Bombay" }
        ];
    }

    /**
     * Step 3b: Fetch the airport translation table (airport data)
     * @returns {Array} - The array of airport objects containing translations
     */
    static getAirportTranslationTable() {
        return [
            { "airport_code": "DEL", "english": "Delhi", "spanish": "Nueva Delhi" },
            { "airport_code": "BOM", "english": "Mumbai", "spanish": "Bombay" }
        ];
    }

    /**
     * Step 3: Build the replacementData array from flightData and translation tables
     * @param {Object} flightData - The flight data
     * @param {Array} keys - The array of keys to look for in flight data (CityName, AirportName, etc.)
     * @param {Array} cityTable - The city translation table
     * @param {Array} airportTable - The airport translation table
     * @returns {Array} - The replacements array in the format [{key: "CityName", value: {old: "Delhi", new: "Nueva Delhi"}}]
     */
    static buildReplacementData(flightData, keys, cityTable, airportTable) {
        const replacements = [];
        const cityLookup = {};
        const airportLookup = {};

        // Build lookup tables from city and airport translation tables
        cityTable.forEach(city => {
            if (city.english && city.spanish) {
                cityLookup[city.english] = city.spanish;
            }
        });

        airportTable.forEach(airport => {
            if (airport.english && airport.spanish) {
                airportLookup[airport.english] = airport.spanish;
            }
        });

        // Recursive function to search for keys (CityName, AirportName) in flightData
        function findKeysAndBuildReplacements(data) {
            if (Array.isArray(data)) {
                data.forEach(item => findKeysAndBuildReplacements(item));
            } else if (typeof data === 'object' && data !== null) {
                for (let key in data) {
                    if (keys.includes(key)) {
                        if (key === "CityName" && cityLookup[data[key]]) {
                            replacements.push({
                                key: key,
                                value: { old: data[key], new: cityLookup[data[key]] }
                            });
                        }
                        if (key === "AirportName" && airportLookup[data[key]]) {
                            replacements.push({
                                key: key,
                                value: { old: data[key], new: airportLookup[data[key]] }
                            });
                        }
                    }
                    if (typeof data[key] === 'object') {
                        findKeysAndBuildReplacements(data[key]);
                    }
                }
            }
        }

        // Start searching for keys in the flight data
        findKeysAndBuildReplacements(flightData);

        return replacements;
    }

    /**
     * Step 4: Replace the keys in the flightData using the replacement array
     * @param {Object} data - The flight data
     * @param {Array} replacements - The array of key-value pairs to replace
     * @returns {Object} - The updated flight data
     */
    static replaceMultipleKeys(data, replacements) {
        // Traverse the data to find and replace based on the key-value pairs
        if (Array.isArray(data)) {
            return data.map(item => FlightService.replaceMultipleKeys(item, replacements));
        } else if (typeof data === 'object' && data !== null) {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    // Check if the current key exists in the replacements array
                    for (const replacement of replacements) {
                        if (key === replacement.key && data[key] === replacement.value.old) {
                            data[key] = replacement.value.new; // Replace the value with the new one
                        }
                    }
                    // Recursively traverse nested objects/arrays
                    if (typeof data[key] === 'object') {
                        data[key] = FlightService.replaceMultipleKeys(data[key], replacements);
                    }
                }
            }
        }
        return data;
    }

    /**
     * Step 5: Full process - Fetch flight data, create replacement array, and replace keys
     */
    static processFlightData() {
        // Step 1: Get flight data
        const flightData = FlightService.getFlightData();

        // Step 2: Get the replacement required keys (CityName, AirportName)
        const keys = FlightService.getReplacementRequiredKeys();

        // Step 3a: Get city translation table
        const cityTable = FlightService.getCityTranslationTable();

        // Step 3b: Get airport translation table
        const airportTable = FlightService.getAirportTranslationTable();

        // Step 3: Build the replacementData array
        const replacementData = FlightService.buildReplacementData(flightData, keys, cityTable, airportTable);

        console.log("Replacement Data:", replacementData);

        // Step 4: Call replaceMultipleKeys with flightData and replacementData
        const updatedFlightData = FlightService.replaceMultipleKeys(flightData, replacementData);

        console.log("Updated Flight Data:", updatedFlightData);
    }
}

// Run the full process
FlightService.processFlightData();
