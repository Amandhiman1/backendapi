const db = require("../models");
const Flight = db.flights;
const Inquiry = db.inquiry;
const WebPages = db.webpages;
const cities = db.cities;
const countries = db.countries;
const languages = db.languages;
const airports = db.airports;
const ipinfo = require("../config/getIPDetails");
const { fetchCityTranslations, replaceCityNamesWithTranslations, replaceMultipleKeys } = require("../utils/helper");
const  {FlightService}  = require("../utils/translation");

exports.getPrimeFlightDeals = async (req, res) => {
  try {
    const { lang } = req.body;
    // Fetch the best deals (example: flights with the lowest prices)

    const geo = await ipinfo.lookupIp();
    const origin = geo?.city || "Delhi";
    
    console.log('origin', origin);

    const primeDeals = await Flight.aggregate([
      {
        $match: {
          "Origin.CityName": origin,
        },
      },
      {
        $sort: {
          "Price.TotalDisplayFare": 1,
        },
      },
      {
        $limit: 10,
      },
    ]);
    res.json({ primeDeals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTopFlightRoutes = async (req, res) => {
  try {
    const { lang } = req.body;
    // Get the client's IP address and perform geo lookup
    const geo = await ipinfo.lookupIp();
    const originCity = geo?.city || "Delhi";

    const topRoutes = await Flight.aggregate([
      { $match: { "Origin.CityName": originCity } },
      {
        $group: {
          _id: "$Destination.CityName",
          totalFlights: { $sum: 1 },
        },
      },
      { $sort: { totalFlights: -1 } },
      { $limit: 10 },
    ]);

    // Send the top routes as the response
    res.json({ topRoutes });
  } catch (error) {
    // Handle any errors and send a 500 status code with the error message
    res.status(500).json({ message: error.message });
  }
};

exports.getPopularDestinations = async (req, res) => {
  try {
    let { lang } = req.body;
    if (!lang) {
      lang = "en";
    }
    const language = await languages.findOne({ code: lang });
    const popularSearchRoutes = await Inquiry.aggregate([
      { $unwind: "$formData.Segments" },
      {
        $group: {
          _id: {
            origin: "$formData.Segments.Origin",
            destination: "$formData.Segments.Destination",
          },
          totalSearches: { $sum: 1 },
        },
      },
      { $sort: { totalSearches: -1 } },
    ]);

    const webpageData = [];
    for (const route of popularSearchRoutes) {
      const originCode = route._id.origin;
      const destinationCode = route._id.destination;

      if (originCode && destinationCode) {
        const originAirport = await airports.findOne({
          $or: [
            { city_code: originCode },
            { country_code: originCode },
            { code: originCode },
          ],
        });

        const originCityName = originAirport?.city_code;
        const origin = await cities.findOne({ city_code: originCityName });

        const destinationAirport = await airports.findOne({
          $or: [
            { city_code: destinationCode },
            { country_code: destinationCode },
            { code: destinationCode },
          ],
        });

        const destinationCityName = destinationAirport?.city_code;
        const destination = await cities.findOne({
          city_code: destinationCityName,
        });

        // Step 3: Construct the Slug and Query the WebPages Schema

        if (origin && destination) {
          const slugPattern = `cheap-flight-from-${
            origin[language.name.toLowerCase()]
          }-to--${destination[language.name.toLowerCase()]}.html`;

          const webPage = await WebPages.findOne({ slug: slugPattern });
          if (webPage) {
            webpageData.push(webPage);
          }
        }
      }
    }
    res.json({ popularRoutes: webpageData });
  } catch (error) {
    console.error("Error calling API:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getNextGetawayInspiration = async (req, res) => {
  try {
    const ip = req.ip;
    const user = await User.findOne({ ip });

    let recommendations = await Flight.find().limit(10);

    if (user && user.searchHistory.length > 0) {
      // Recommend based on user's search history
      recommendations = await Flight.find({
        $or: user.searchHistory.map((history) => ({
          to: history.to,
        })),
      }).limit(10);
    }

    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.lastMinuteFlights = async (req, res) => {
  try {
    const { lang } = req.body;
    const geo = await ipinfo.lookupIp();
    const origin = geo?.city || "Delhi";

    // use language to filter give code in next line

    const lastMinuteDeals = await Flight.aggregate([
      {
        $match: {
          "Origin.CityName": origin,
          "Price.TotalDisplayFare": { $lt: 100 },
        },
      },
      {
        $sort: {
          "Price.TotalDisplayFare": 1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    // add language filter

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.airlinesFlights = async (req, res) => {
  try {
    const { lang } = req.body;
    const geo = await ipinfo.lookupIp();
    const origin = geo?.city || "Delhi";

    const airlinesFlights = await Flight.aggregate([
      {
        $match: {
          "Origin.CityName": origin,
        },
      },
      {
        $group: {
          _id: "$Airline.AirlineName",
          totalFlights: { $sum: 1 },
        },
      },
      { $sort: { totalFlights: -1 } },
      { $limit: 10 },
    ]);

    // add language filter

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



exports.findFlightsByDestinationType = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Mapping for the placeholders to the corresponding fields in MongoDB
      const objPlace = {
          '%city2%': 'Destination.CityName',
          '%country2%': 'Destination.Country',
          '%continent2%': 'Destination.Continent',
      };

      // Construct the query object dynamically using the mappings
      let queryString = Object.keys(query).reduce((acc, key) => {
          if (objPlace[key]) {
              acc[objPlace[key]] = query[key];
          }
          return acc;
      }, {});

      // Add logic to filter flights with origin time after the current moment
      const currentTime = new Date();
      queryString['Origin.DateTime'] = { $gt: currentTime.toISOString() };

      console.log('Current Time:', currentTime);
      console.log('Query String:', queryString);

      // Fetch flights sorted by the cheapest total fare
      const flights = await Flight.find(queryString)
          .sort({ 'Price.TotalDisplayFare': 'asc' })
          .limit(limit);

      res.json({ flights, queryString });
  } catch (error) {
      console.error('Error fetching flights by destination type:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.findFastestFlight = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      const cityTranslations = await fetchCityTranslations(lang); // Fetch city translations based on the language

      // Mapping for the placeholders to the corresponding fields in MongoDB
      const objPlace = {
          '%city%': 'Origin.CityName',
          '%city2%': 'Destination.CityName',
          '%country%': 'Origin.Country',
          '%country2%': 'Destination.Country',
          '%continent%': 'Origin.Continent',
          '%continent2%': 'Destination.Continent',
      };

      // Construct the query object dynamically using the mappings
      let queryString = Object.keys(query).reduce((acc, key) => {
          if (objPlace[key]) {
              acc[objPlace[key]] = query[key];
          }
          return acc;
      }, {});

      // Add logic to filter flights with origin time after the current moment
      const currentTime = new Date();
      queryString['Origin.DateTime'] = { $gt: currentTime.toISOString() };

      console.log('Current Time:', currentTime);
      console.log('Query String:', queryString);

      // Fetch flights sorted by the shortest duration between the specified origin and destination
      const flights = await Flight.find(queryString)
          .sort({ 'Flight.FlightDetails.Details.0.Duration': 'asc' })
          .limit(limit);

      // Replace city names with translated values
      // console.log('Flights:', flights);
      const newFlights = await replaceCityNamesWithTranslations(flights, cityTranslations);
      // console.log('New Flights:', newFlights);
      res.json({ flights, queryString });
  } catch (error) {
      console.error('Error fetching fastest flight:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


// controllers/reports.controller.js
exports.findLongestFlight = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Mapping for the placeholders to the corresponding fields in MongoDB
      const objPlace = {
          '%city%': 'Origin.CityName',
          '%city2%': 'Destination.CityName',
          '%country%': 'Origin.Country',
          '%country2%': 'Destination.Country',
          '%continent%': 'Origin.Continent',
          '%continent2%': 'Destination.Continent',
      };

      // Construct the query object dynamically using the mappings
      let queryString = Object.keys(query).reduce((acc, key) => {
          if (objPlace[key]) {
              acc[objPlace[key]] = query[key];
          }
          return acc;
      }, {});

      // Add logic to filter flights with origin time after the current moment
      const currentTime = new Date();
      queryString['Origin.DateTime'] = { $gt: currentTime.toISOString() };

      console.log('Current Time:', currentTime);
      console.log('Query String:', queryString);

      // Fetch flights sorted by the longest duration between the specified origin and destination
      const flights = await Flight.find(queryString)
          .sort({ 'Flight.FlightDetails.Details.0.Duration': 'desc' })
          .limit(limit);

      res.json({ flights, queryString });
  } catch (error) {
      console.error('Error fetching longest flight:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.findConnectingFlights = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Mapping for the placeholders to the corresponding fields in MongoDB
      const objPlace = {
        '%city%': 'Origin.CityName',
        '%city2%': 'Destination.CityName',
        '%country%': 'Origin.Country',
        '%country2%': 'Destination.Country',
        '%continent%': 'Origin.Continent',
        '%continent2%': 'Destination.Continent',
    };

      // Construct the query object dynamically using the mappings
      let queryString = Object.keys(query).reduce((acc, key) => {
          if (objPlace[key]) {
              acc[objPlace[key]] = query[key];
          }
          return acc;
      }, {});

      // Add logic to filter flights with origin time after the current moment
      const currentTime = new Date();
      queryString['Origin.DateTime'] = { $gt: currentTime.toISOString() };

      console.log('Current Time:', currentTime);
      console.log('Query String:', queryString);

      // Query for flights that have at least one stop between the origin and destination
      const connectingFlights = await Flight.aggregate([
          {
              $match: queryString
          },
          {
              $match: {
                  StopsNumber: { $gt: 0 } // Ensure there is at least one stop
              }
          },
          {
              $sort: { 'Origin.DateTime': 1 } // Optional: Sort by departure time
          },
          {
              $limit: limit // Limit the number of results
          }
      ]);

      res.json({ connectingFlights, queryString });
  } catch (error) {
      console.error('Error fetching connecting flights:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.findFlightsFromLocation = async (req, res) => {
  try {
      const { query, flightsNumber,stopNumbers, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Mapping for the placeholders to the corresponding fields in MongoDB
      const originMapping = {
          '%city%': 'Origin.CityName',
          '%country%': 'Origin.Country',
          '%continent%': 'Origin.Continent'
      };

      // Construct the query object dynamically using the mappings
      let queryString = Object.keys(query).reduce((acc, key) => {
          if (originMapping[key]) {
              acc[originMapping[key]] = query[key];
          }
          return acc;
      }, {});

      if(stopNumbers) {
          queryString["StopsNumber"] = stopNumbers;
      }

      // Add logic to filter flights with origin time after the current moment
      const currentTime = new Date();
      queryString['Origin.DateTime'] = { $gt: currentTime.toISOString() };

      console.log('Current Time:', currentTime);
      console.log('Query String:', queryString);

      // Fetch flights sorted by departure time or any other criteria
      const flights = await Flight.find(queryString)
          .sort({ 'Origin.DateTime': 'asc' }) // Optionally sort by departure time
          .limit(limit);

          const keys =await FlightService.getReplacementRequiredKeys();
          console.log('Keys:', keys);
    
          const replacementData =await FlightService.buildReplacementData(flights, keys, lang);
          console.log('Replacement Data:', replacementData);
    
          if(replacementData.length === 0) {
              return res.status(400).json({ message: 'No data found for the specified language.' });
          }
    
          const updatedFlightData = await FlightService.replaceMultipleKeys(flights, replacementData);
    
          replaceMultipleKeys(flights, replacementData);

      res.json({ flights: updatedFlightData, queryString });
  } catch (error) {
      console.error('Error fetching flights from location:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.findFlightsToLocation = async (req, res) => {
  try {
      const { query, flightsNumber,stopNumbers, lang, type } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Mapping for the placeholders to the corresponding fields in MongoDB
      const originMapping = {
          '%city%': 'Origin.CityName',
          '%city2%': 'Destination.CityName',
          '%country%': 'Origin.Country',
          '%country2%': 'Destination.Country',
          '%continent%': 'Origin.Continent',
          '%continent2%': 'Destination.Continent'
      };

      // Construct the query object dynamically using the mappings
      let queryString = Object.keys(query).reduce((acc, key) => {
          if (originMapping[key]) {
              acc[originMapping[key]] = query[key];
          }
          return acc;
      }, {});

      if(stopNumbers) {
          queryString["StopsNumber"] = stopNumbers;
      }

      // Add logic to filter flights with origin time after the current moment
      const currentTime = new Date();
      queryString['Origin.DateTime'] = { $gt: currentTime.toISOString() };

      console.log('Current Time:', currentTime);
      console.log('Query String:', queryString);

      let flights;

      if (type === 'one-way') {
          // Fetch one-way flights sorted by departure time
          flights = await Flight.find(queryString)
              .sort({ 'Origin.DateTime': 'asc' }) // Optionally sort by departure time
              .limit(limit);
      } else if (type === 'return') {
          // Fetch return flights (both outbound and inbound)
          const outboundFlights = await Flight.find(queryString)
              .sort({ 'Origin.DateTime': 'asc' }) // Sort by outbound departure time
              .limit(limit);

          // Construct the return flight query based on outbound destination as origin and vice versa
          const returnQueryString = {
              'Origin.CityName': query['%city2%'],
              'Destination.CityName': query['%city%'],
              'Origin.DateTime': { $gt: currentTime.toISOString() },
          };

          const returnFlights = await Flight.find(returnQueryString)
              .sort({ 'Origin.DateTime': 'asc' }) // Sort by inbound departure time
              .limit(limit);

          flights = { outboundFlights, returnFlights };
      } else {
          return res.status(400).json({ message: 'Invalid type provided. Must be "one-way" or "return".' });
      }

      const keys =await FlightService.getReplacementRequiredKeys();
      console.log('Keys:', keys);

      const replacementData =await FlightService.buildReplacementData(flights, keys, lang);
      console.log('Replacement Data:', replacementData);

      if(replacementData.length === 0) {
          return res.status(400).json({ message: 'No data found for the specified language.' });
      }

      const updatedFlightData = await FlightService.replaceMultipleKeys(flights, replacementData);

      replaceMultipleKeys(flights, replacementData);
      res.json({ flights:updatedFlightData, queryString });
  } catch (error) {
      console.error('Error fetching flights:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.findAirlinesFlying = async (req, res) => {
  try {
      const { query,flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4;
      // Mapping for the placeholders to the corresponding fields in MongoDB
      const originMapping = {
          '%city%': 'Origin.CityName',
          '%country%': 'Origin.Country',
          '%continent%': 'Origin.Continent',
          '%city2%': 'Destination.CityName',
          '%country2%': 'Destination.Country',
          '%continent2%': 'Destination.Continent'
      };

      // Construct the query object dynamically using the mappings
      let queryString = Object.keys(query).reduce((acc, key) => {
          if (originMapping[key]) {
              acc[originMapping[key]] = query[key];
          }
          return acc;
      }, {});

      console.log('Query String:', queryString);

      // Fetch distinct airlines flying between the specified origin and destination
      const airlines = await Flight.distinct('Flight.FlightDetails.Details.0.OperatorName', queryString);
      const keys =await FlightService.getReplacementRequiredKeys();
      console.log('Keys:', keys);

      const replacementData =await FlightService.buildReplacementData(airlines, keys, lang);
      console.log('Replacement Data:', replacementData);

      if(replacementData.length === 0) {
          return res.status(400).json({ message: 'No data found for the specified language.' });
      }

      const updatedFlightData = await FlightService.replaceMultipleKeys(airlines, replacementData);

      replaceMultipleKeys(airlines, replacementData);
      res.json({ airlines: updatedFlightData, queryString });
  } catch (error) {
      console.error('Error fetching airlines:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.findAirlineFlightsToLocation = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Mapping for the placeholders to the corresponding fields in MongoDB
      const destinationMapping = {
          '%city2%': 'Destination.CityName',
          '%country2%': 'Destination.Country'
      };

      // Construct the query object dynamically using the mappings
      let queryString = Object.keys(query).reduce((acc, key) => {
          if (destinationMapping[key]) {
              acc[destinationMapping[key]] = query[key];
          }
          return acc;
      }, {});

      // Add filter for airline and only future flights
      queryString["Flight.FlightDetails.Details.0.OperatorName"] = query["%airline%"]; // Assuming "%airline%" is passed in the query
      queryString["Origin.DateTime"] = { $gt: new Date().toISOString() };

      const flights = await Flight.find(queryString)
            .limit(limit);
            const keys =await FlightService.getReplacementRequiredKeys();
            console.log('Keys:', keys);
      
            const replacementData =await FlightService.buildReplacementData(flights, keys, lang);
            console.log('Replacement Data:', replacementData);
      
            if(replacementData.length === 0) {
                return res.status(400).json({ message: 'No data found for the specified language.' });
            }
      
            const updatedFlightData = await FlightService.replaceMultipleKeys(flights, replacementData);
      
            replaceMultipleKeys(flights, replacementData);
      res.json({ flights: updatedFlightData, queryString });
  } catch (error) {
      console.error('Error fetching airline flights:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.findFlightsBetweenLocations = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Mapping for the placeholders to the corresponding fields in MongoDB
      const locationMapping = {
          '%city%': 'Origin.CityName',
          '%city2%': 'Destination.CityName',
          '%country%': 'Origin.Country',
          '%country2%': 'Destination.Country'
      };

      // Construct the query object dynamically using the mappings
      let queryString = Object.keys(query).reduce((acc, key) => {
          if (locationMapping[key]) {
              acc[locationMapping[key]] = query[key];
          }
          return acc;
      }, {});

      // Add logic to filter flights with origin time after the current moment
      queryString['Origin.DateTime'] = { $gt: new Date().toISOString() };

      console.log('Query String:', queryString);

      // Fetch flights based on the constructed query
      const flights = await Flight.find(queryString).limit(limit);

      const keys =await FlightService.getReplacementRequiredKeys();
      console.log('Keys:', keys);

      const replacementData =await FlightService.buildReplacementData(flights, keys, lang);
      console.log('Replacement Data:', replacementData);

      if(replacementData.length === 0) {
          return res.status(400).json({ message: 'No data found for the specified language.' });
      }

      const updatedFlightData = await FlightService.replaceMultipleKeys(flights, replacementData);

      replaceMultipleKeys(flights, replacementData);

      res.json({ flights: updatedFlightData, queryString });
  } catch (error) {
      console.error('Error fetching flights between locations:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.listFlightsByAirline = async (req, res) => {
  try {
      const { query, flightsNumber, StopsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Extract airline name from query
      const airline = query["%airline%"];
      if (!airline) {
          return res.status(400).json({ message: 'Airline name is required in query with key "%airline%".' });
      }

      // Construct the query object to filter by airline
      let queryString = {
          "Flight.FlightDetails.Details.0.OperatorName": airline,
          "Origin.DateTime": { $gt: new Date().toISOString() } // Only future flights
      };

      if(StopsNumber) {
          queryString["StopsNumber"] = StopsNumber; // Filter for direct flights only
      }

      console.log('Query String:', queryString);

      // Fetch flights based on the constructed query
      const flights = await Flight.find(queryString).limit(limit);

      const keys =await FlightService.getReplacementRequiredKeys();
      console.log('Keys:', keys);

      const replacementData =await FlightService.buildReplacementData(flights, keys, lang);
      console.log('Replacement Data:', replacementData);

      if(replacementData.length === 0) {
          return res.status(400).json({ message: 'No data found for the specified language.' });
      }

      const updatedFlightData = await FlightService.replaceMultipleKeys(flights, replacementData);

      replaceMultipleKeys(flights, replacementData);

      res.json({ flights: updatedFlightData, queryString });
  } catch (error) {
      console.error('Error fetching flights by airline:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.findAirlineFlightsBetweenLocations = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Mapping for the placeholders to the corresponding fields in MongoDB
      const locationMapping = {
          '%city%': 'Origin.CityName',
          '%city2%': 'Destination.CityName',
          '%country%': 'Origin.Country',
          '%country2%': 'Destination.Country'
      };

      // Extract airline name from query
      const airline = query["%airline%"];
      if (!airline) {
          return res.status(400).json({ message: 'Airline name is required in query with key "%airline%".' });
      }

      // Construct the query object dynamically using the mappings
      let queryString = Object.keys(query).reduce((acc, key) => {
          if (locationMapping[key]) {
              acc[locationMapping[key]] = query[key];
          }
          return acc;
      }, {});

      // Add logic to filter flights for the specified airline and with origin time after the current moment
      queryString["Flight.FlightDetails.Details.0.OperatorName"] = airline;
      queryString['Origin.DateTime'] = { $gt: new Date().toISOString() };

      console.log('Query String:', queryString);

      // Fetch flights based on the constructed query
      const flights = await Flight.find(queryString).limit(limit);

      const keys =await FlightService.getReplacementRequiredKeys();
      console.log('Keys:', keys);

      const replacementData =await FlightService.buildReplacementData(flights, keys, lang);
      console.log('Replacement Data:', replacementData);

      if(replacementData.length === 0) {
          return res.status(400).json({ message: 'No data found for the specified language.' });
      }

      const updatedFlightData = await FlightService.replaceMultipleKeys(flights, replacementData);

      replaceMultipleKeys(flights, replacementData);

      res.json({ flights: updatedFlightData, queryString });
  } catch (error) {
      console.error('Error fetching airline flights between locations:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.findAirlineDirectFlightsToLocation = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Extract the type and value from the query
      const type = query.type; // 'city' or 'country'
      const value = query.value; // Name of the city or country
      const airline = query["%airline%"]; // Name of the airline

      // Ensure both airline and type are provided
      if (!airline || !type) {
          return res.status(400).json({ message: 'Airline and type (city or country) are required in the query.' });
      }

      // Mapping for the type to the corresponding field in MongoDB
      const destinationMapping = {
          'city': 'Destination.CityName',
          'country': 'Destination.Country'
      };

      // Determine the field to filter based on the type provided
      const filterField = destinationMapping[type];
      if (!filterField) {
          return res.status(400).json({ message: 'Invalid type provided. Must be "city" or "country".' });
      }

      // Construct the query object dynamically using the type and value
      let queryString = {
          [filterField]: value,
          "Flight.FlightDetails.Details.0.OperatorName": airline,
          "StopsNumber": 0, // Only direct flights
          "Origin.DateTime": { $gt: new Date().toISOString() } // Only future flights
      };

      console.log('Query String:', queryString);

      // Fetch flights based on the constructed query
      const flights = await Flight.find(queryString).limit(limit);

      const keys =await FlightService.getReplacementRequiredKeys();
      console.log('Keys:', keys);

      const replacementData =await FlightService.buildReplacementData(flights, keys, lang);
      console.log('Replacement Data:', replacementData);

      if(replacementData.length === 0) {
          return res.status(400).json({ message: 'No data found for the specified language.' });
      }

      const updatedFlightData = await FlightService.replaceMultipleKeys(flights, replacementData);

      replaceMultipleKeys(flights, replacementData);

      res.json({ flights: updatedFlightData, queryString });
  } catch (error) {
      console.error('Error fetching airline direct flights:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.findAirlineDirectFlightsBetweenLocations = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Extract values from the query
      const airline = query["%airline%"];
      const originCity = query["%city%"];
      const destinationCity = query["%city2%"];
      const originCountry = query["%country%"];
      const destinationCountry = query["%country2%"];

      // Ensure airline is provided
      if (!airline) {
          return res.status(400).json({ message: 'Airline name is required in query with key "%airline%".' });
      }

      // Construct the query object dynamically using the placeholders
      let queryString = {
          "Flight.FlightDetails.Details.0.OperatorName": airline,
          "StopsNumber": 0, // Only direct flights
          "Origin.DateTime": { $gt: new Date().toISOString() } // Only future flights
      };

      // Determine the fields to filter based on the provided origin and destination
      if (originCity) queryString["Origin.CityName"] = originCity;
      if (destinationCity) queryString["Destination.CityName"] = destinationCity;
      if (originCountry) queryString["Origin.Country"] = originCountry;
      if (destinationCountry) queryString["Destination.Country"] = destinationCountry;

      console.log('Query String:', queryString);

      // Fetch flights based on the constructed query
      const flights = await Flight.find(queryString).limit(limit);

      const keys =await FlightService.getReplacementRequiredKeys();
      console.log('Keys:', keys);

      const replacementData =await FlightService.buildReplacementData(flights, keys, lang);
      console.log('Replacement Data:', replacementData);

      if(replacementData.length === 0) {
          return res.status(400).json({ message: 'No data found for the specified language.' });
      }

      const updatedFlightData = await FlightService.replaceMultipleKeys(flights, replacementData);

      replaceMultipleKeys(flights, replacementData);

      res.json({ flights: updatedFlightData, queryString });
  } catch (error) {
      console.error('Error fetching airline direct flights between locations:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.findAirlineConnectingFlights = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Extract values from the query
      const airline = query["%airline%"];
      const originCity = query["%city%"];
      const destinationCity = query["%city2%"];
      const originCountry = query["%country%"];
      const destinationCountry = query["%country2%"];

      // Ensure airline is provided
      if (!airline) {
          return res.status(400).json({ message: 'Airline name is required in query with key "%airline%".' });
      }

      // Construct the query object dynamically using the placeholders
      let queryString = {
          "Flight.FlightDetails.Details.0.OperatorName": airline,
          "StopsNumber": { $gt: 0 }, // Only connecting flights (more than 0 stops)
          // "Origin.DateTime": { $gt: new Date().toISOString() } // Only future flights
      };

      // Determine the fields to filter based on the provided origin and destination
      if (originCity) queryString["Origin.CityName"] = originCity;
      if (destinationCity) queryString["Destination.CityName"] = destinationCity;
      if (originCountry) queryString["Origin.Country"] = originCountry;
      if (destinationCountry) queryString["Destination.Country"] = destinationCountry;

      console.log('Query String:', queryString);

      // Fetch flights based on the constructed query
      const flights = await Flight.find(queryString).limit(limit);

      const keys =await FlightService.getReplacementRequiredKeys();
      console.log('Keys:', keys);

      const replacementData =await FlightService.buildReplacementData(flights, keys, lang);
      console.log('Replacement Data:', replacementData);

      if(replacementData.length === 0) {
          return res.status(400).json({ message: 'No data found for the specified language.' });
      }

      const updatedFlightData = await FlightService.replaceMultipleKeys(flights, replacementData);

      replaceMultipleKeys(flights, replacementData);

      res.json({ flights: updatedFlightData, queryString });
  } catch (error) {
      console.error('Error fetching airline connecting flights:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.findOneWayFlights = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Extract values from the query
      const originCity = query["%city%"];
      const destinationCity = query["%city2%"];
      const originCountry = query["%country%"];
      const destinationCountry = query["%country2%"];

      // Construct the query object dynamically using the placeholders
      let queryString = {
          "Origin.DateTime": { $gt: new Date().toISOString() } // Only future flights
      };

      // Determine the fields to filter based on the provided origin and destination
      if (originCity) queryString["Origin.CityName"] = originCity;
      if (destinationCity) queryString["Destination.CityName"] = destinationCity;
      if (originCountry) queryString["Origin.Country"] = originCountry;
      if (destinationCountry) queryString["Destination.Country"] = destinationCountry;

      console.log('Query String:', queryString);

      // Fetch one-way flights based on the constructed query
      const flights = await Flight.find(queryString).limit(limit);

      const keys =await FlightService.getReplacementRequiredKeys();
      console.log('Keys:', keys);

      const replacementData =await FlightService.buildReplacementData(flights, keys, lang);
      console.log('Replacement Data:', replacementData);

      if(replacementData.length === 0) {
          return res.status(400).json({ message: 'No data found for the specified language.' });
      }

      const updatedFlightData = await FlightService.replaceMultipleKeys(flights, replacementData);

      replaceMultipleKeys(flights, replacementData);

      res.json({ flights: updatedFlightData, queryString });
  } catch (error) {
      console.error('Error fetching one-way flights:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.findReturnFlights = async (req, res) => {
  try {
      const { query, flightsNumber, lang } = req.body; // Destructure the input from the request body
      const limit = flightsNumber * 4; // Set the limit based on the number of flights requested

      // Extract values from the query
      const originCity = query["%city%"];
      const destinationCity = query["%city2%"];
      const originCountry = query["%country%"];
      const destinationCountry = query["%country2%"];

      // Construct the query object dynamically using the placeholders for outbound flight
      let outboundQueryString = {
          "Origin.DateTime": { $gt: new Date().toISOString() } // Only future flights
      };

      // Determine the fields to filter based on the provided origin and destination for outbound flight
      if (originCity) outboundQueryString["Origin.CityName"] = originCity;
      if (destinationCity) outboundQueryString["Destination.CityName"] = destinationCity;
      if (originCountry) outboundQueryString["Origin.Country"] = originCountry;
      if (destinationCountry) outboundQueryString["Destination.Country"] = destinationCountry;

      console.log('Outbound Query String:', outboundQueryString);

      // Construct the query object dynamically for return flight
      let returnQueryString = {
          "Destination.DateTime": { $gt: new Date().toISOString() } // Only future flights
      };

      // Reverse the origin and destination for the return flight
      if (originCity) returnQueryString["Destination.CityName"] = originCity;
      if (destinationCity) returnQueryString["Origin.CityName"] = destinationCity;
      if (originCountry) returnQueryString["Destination.Country"] = originCountry;
      if (destinationCountry) returnQueryString["Origin.Country"] = destinationCountry;

      console.log('Return Query String:', returnQueryString);

      // Fetch outbound and return flights based on the constructed queries
      const outboundFlights = await Flight.find(outboundQueryString).limit(limit);
      const returnFlights = await Flight.find(returnQueryString).limit(limit);

      const keys =await FlightService.getReplacementRequiredKeys();
      console.log('Keys:', keys);

      const replacementDataOutBound =await FlightService.buildReplacementData(outboundFlights, keys, lang);
      const replacementDataReturn =await FlightService.buildReplacementData(returnFlights, keys, lang);
      console.log('Replacement Data:', replacementData);

      if(replacementDataOutBound.length === 0 && replacementDataReturn.length === 0) {
          return res.status(400).json({ message: 'No data found for the specified language.' });
      }

      const updatedFlightDataOutBound = await FlightService.replaceMultipleKeys(replacementDataOutBound, replacementData);
      const updatedFlightDataReturn = await FlightService.replaceMultipleKeys(replacementDataReturn, replacementData);

      replaceMultipleKeys(outboundFlights, replacementData);
      replaceMultipleKeys(returnFlights, replacementData);

      res.json({ outboundFlights: updatedFlightDataOutBound, returnFlights: updatedFlightDataReturn });
  } catch (error) {
      console.error('Error fetching return flights:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};