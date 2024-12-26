const db = require('../models'); // Import the City model

const Cities = db.cities; // Define the City model

/**
 * Fetch city translations based on the given language.
 * @param {string} lang - The language code (e.g., 'es' or 'spanish').
 * @returns {Object} - An object containing city translations.
 */
async function fetchCityTranslations(lang) {
    try {
        // Define the language field based on the provided language code
        const languageField = lang === 'es' || lang.toLowerCase() === 'spanish' ? 'spanish' : 'english';

        // Query the cities table to get translations
        const cities = await Cities.find({}, { city_code: 1, [languageField]: 1 });
        

        // Construct a mapping of city codes to their translated names
        const cityTranslations = {};
        cities.forEach(city => {
            cityTranslations[city.city_code] = city[languageField];
        });

        return cityTranslations;
    } catch (error) {
        console.error('Error fetching city translations:', error.message);
        throw new Error('Unable to fetch city translations');
    }
}




/**
 * Replace city names in flight responses with their translated values.
 * @param {Array} flights - The flight data array.
 * @param {Object} cityTranslations - An object containing city translations.
 */
// function replaceCityNamesWithTranslations(flights, cityTranslations) {
//     flights.forEach(flight => {
//         // Replace origin and destination city names with their translated values
//         if (flight.Origin && cityTranslations[flight.Origin.CityName]) {
//             flight.Origin.CityName = cityTranslations[flight.Origin.CityName];
//         }
//         if (flight.Destination && cityTranslations[flight.Destination.CityName]) {
//             flight.Destination.CityName = cityTranslations[flight.Destination.CityName];
//         }
//     });
// }

 function replaceCityNamesWithTranslations(data, cityTranslations) {
    console.log('cityTranslations', cityTranslations);
    if (Array.isArray(data)) {
        // If the data is an array, recursively replace in each element
        console.log('is data array', true);
        return data.map(item => replaceCityNamesWithTranslations(item, cityTranslations));
    } else if (typeof data === 'object' && data !== null) {
        // If the data is an object, check each key for city names
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                
                if (key === 'CityName' && cityTranslations[data[key]]) {
                    console.log('key', data[key]);
                    data[key] = cityTranslations[data[key]];
                    // console.log('cityTranslations', cityTranslations[data[key]]);
                } else {
                    // Recursively call for nested objects or arrays
                    data[key] = replaceCityNamesWithTranslations(data[key], cityTranslations);
                }
            }
        }
        return data;
    }
    // If the data is neither an array nor an object, return it as is
    return data;
}


function replaceMultipleKeys(data, replacements) {
    // Traverse the data to find and replace based on the key-value pairs
    if (Array.isArray(data)) {
        return data.map(item => replaceMultipleKeys(item, replacements));
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
                    data[key] = replaceMultipleKeys(data[key], replacements);
                }
            }
        }
    }
    return data;
}

module.exports = {
    fetchCityTranslations,
    replaceCityNamesWithTranslations,
    replaceMultipleKeys
};