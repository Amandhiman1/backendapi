const db =  require("../models");
const Cities = db.cities;
const Airports = db.airports;
const Airlines = db.airlines
const Countries = db.countries

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
     * Step 2: Fetch required replacement keys (Mocked example)
     * @returns {Array} - The array of replacement keys to search in the flight data
     */
    static getReplacementRequiredKeys() {
        return ["CityName", "AirportName", "AirlineName", "CountryName"];
    }

    /**
     * Step 3: Generalized function to dynamically fetch translation tables based on the entity type
     * @param {String} entity - The type of entity (e.g., city, airport, airline, country)
     * @returns {Array} - The translation table for the entity
     */
    static async getTranslationTable(entity) {
        switch (entity) {
            case "CityName":
                const cities = await Cities.find({});
                return cities
            case "AirportName":
                return await Airports.find();
            case "AirlineName":
                return await Airlines.find();
            case "CountryName":
                return await Countries.find();
            default:
                return [];
        }
    }

    /**
     * Step 3: Build the replacementData array from flightData and dynamic translation tables
     * @param {Object} flightData - The flight data
     * @param {Array} keys - The array of keys to look for in flight data (CityName, AirportName, etc.)
     * @returns {Array} - The replacements array in the format [{key: "CityName", value: {old: "Delhi", new: "Nueva Delhi"}}]
     */
    static async buildReplacementData(flightData, keys, lang) {
        const replacements = [];
        const visitedObjects = new WeakSet(); // To track processed objects and avoid circular references
      
        // Iterate over each key (e.g., CityName, AirportName) and fetch the corresponding translation table
        for (let key of keys) {
          const translationTable = await FlightService.getTranslationTable(key, lang); // Pass the lang parameter
      
          // Ensure translationTable is always an array before proceeding
          if (Array.isArray(translationTable)) {
            const lookup = {};
      
            // Build a lookup table for faster access
            translationTable.forEach(item => {
              if (item[lang] && item.english) {
                lookup[item.english] = item[lang]; // Use the lang key (e.g., spanish, french)
              }
            });
      
            // Recursive function to search for keys (CityName, AirportName, etc.) in flightData
            function findKeysAndBuildReplacements(data, depth = 0) {
              if (depth > 100 || visitedObjects.has(data)) {
                return;
              }
      
              if (typeof data === 'object' && data !== null) {
                visitedObjects.add(data);
              }
      
              if (Array.isArray(data)) {
                data.forEach(item => findKeysAndBuildReplacements(item, depth + 1));
              } else if (typeof data === 'object' && data !== null) {
                for (let key in data) {
                  if (keys.includes(key) && lookup[data[key]]) {
                    replacements.push({
                      key: key,
                      value: { old: data[key], new: lookup[data[key]] }
                    });
                  }
                  if (typeof data[key] === 'object' && data[key] !== null) {
                    findKeysAndBuildReplacements(data[key], depth + 1);
                  }
                }
              }
            }
      
            // Start searching for keys in the flight data
            findKeysAndBuildReplacements(flightData);
          }
        }
      
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

        // Step 2: Get the replacement required keys (CityName, AirportName, etc.)
        const keys = FlightService.getReplacementRequiredKeys();

        // Step 3: Build the replacementData array using dynamic translation tables
        const replacementData = FlightService.buildReplacementData(flightData, keys);

        console.log("Replacement Data:", replacementData);

        // Step 4: Call replaceMultipleKeys with flightData and replacementData
        const updatedFlightData = FlightService.replaceMultipleKeys(flightData, replacementData);

        console.log("Updated Flight Data:", updatedFlightData);
    }
}

// Run the full process
// FlightService.processFlightData();

exports.FlightService = FlightService;