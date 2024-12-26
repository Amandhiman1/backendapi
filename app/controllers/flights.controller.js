const axios = require("axios");
const db = require("../models");
const diff = require('diff');
// const Owflights = db.owflights;
// const Rtflights = db.rtflights;
// const Mcflights = db.mcflights;
const Flights = db.flights;
const PageType = db.page_types;

exports.create = async (req, res) => {
    try {
        console.log('req.body', req.body);
        const apiUrl = 'http://test.services.travelomatix.com/webservices/index.php/flight/service/Search';

        // Headers you want to include in the request
        const headers = {
            'Content-Type': 'application/json',
            'x-Username': 'test245274',
            'x-DomainKey': 'TMX3372451534825527',
            'x-system': 'test',
            'x-Password': 'test@245',
        };

        const response = await axios.post(apiUrl, req.body, { headers });
        console.log(response.data);
        const journeyList = response.data.Search.FlightDataList.JourneyList;
        // console.log('journeyList ==> ' + journeyList)

        const savePromises = journeyList.map(async (journey) => {
            const flightDataList = journey;
            const saveFlightPromises = flightDataList.map(async (flight) => {
                const origin = flight.FlightDetails.Details[0][0].Origin;
                const airline = flight.FlightDetails.Details[0][0].OperatorName;
                const destination = flight.FlightDetails.Details[0].slice(-1)[0].Destination;
                const stopsNumber = flight.FlightDetails.Details[0].length - 1;

                const stops = flight.FlightDetails.Details[0].slice(0, -1).map(stop => stop.Destination);
                const ticketPrice = flight.Price.PassengerBreakup.ADT.TotalPrice / parseInt(flight.Price.PassengerBreakup.ADT.PassengerCount);

                const newFlight = new Flights({
                    "Flight": flight,
                    "Origin": origin,
                    "Destination": destination,
                    "StopsNumber": stopsNumber,
                    "StopsName": stops.map(stop => stop),
                    "Price": ticketPrice,
                    "Airline": airline,
                    "Cabin": req.body.CabinClass
                });

                return newFlight.toObject(); // Convert to plain object to avoid potential MongoDB versioning issues
            });

            const savedFlights = await Promise.all(saveFlightPromises);

            // Use bulk insert instead of saving each flight individually
            await Flights.insertMany(savedFlights);
        });

        await Promise.all(savePromises);

        res.send({ message: 'Flights successfully created.' });
    } catch (error) {
        console.error('Error calling API:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getFlightsByRoute = async (req, res) => {
    try {
        const { originCode, destinationCode } = req.query;

        // Use Mongoose find method to get flights with a stopover matching the specified codes
        const flights = await Flights.find({
            'Flight.FlightDetails.Details': {
                $elemMatch: {
                    'Origin.AirportCode': originCode,
                    'Destination.AirportCode': destinationCode,
                },
            },
        });

        res.json({ flights });
    } catch (error) {
        console.error('Error fetching flights:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.findBySlug = async (req, res) => {
    try {
        const values = req.body.query;
        const objPlace = {
            '%city%': 'Origin.CityName',
            '%city2%': 'Destination.CityName',
            '%airline': 'Flight.FlightDetails.Details.0.Operatedbyairlinename',
            '%airport%': 'Origin.AirportName',
            '%airport2%': 'Destination.AirportName'
        }

        let queryString = Object.keys(values).reduce((acc, key) => {
            acc[objPlace[key]] = values[key];
            return acc;
        }, {});

        const flights = await Flights.find(queryString)
        res.json({ flights, queryString });
    } catch (error) {
        console.error('Error fetching flights:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getLatestFlights = async (req, res) => {
    try {
        const values = req.body.query;
        const limit = req.body.flightsNumber * 4;
        const objPlace = {
            '%city%': 'Origin.CityName',
            '%city2%': 'Destination.CityName',
            '%airline': 'Flight.FlightDetails.Details.0.Operatedbyairlinename',
            '%airport%': 'Origin.AirportName',
            '%airport2%': 'Destination.AirportName',
        };

        let queryString = Object.keys(values).reduce((acc, key) => {
            acc[objPlace[key]] = values[key];
            return acc;
        }, {});

        // Add logic to filter flights with origin time after the current moment
        const currentTime = new Date();
        queryString['Origin.DateTime'] = { $gt: currentTime.toISOString() };

        console.log('Current Time:', currentTime);
        console.log('Query String:', queryString);

        const flights = await Flights.find(queryString).sort({ 'Origin.DateTime': 'asc' }).limit(limit);

        res.json({ flights, queryString });
    } catch (error) {
        console.error('Error fetching flights:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Assuming you have already required the necessary dependencies and defined the Flight model

exports.findCheapestFlights = async (req, res) => {
    try {
        const values = req.body.query;
        const limit = req.body.flightsNumber * 4;
        const objPlace = {
            '%city%': 'Origin.CityName',
            '%city2%': 'Destination.CityName',
            '%airline': 'Flight.FlightDetails.Details.0.Operatedbyairlinename',
            '%airport%': 'Origin.AirportName',
            '%airport2%': 'Destination.AirportName',
        };

        let queryString = Object.keys(values).reduce((acc, key) => {
            acc[objPlace[key]] = values[key];
            return acc;
        }, {});

        // Add logic to filter flights with origin time after the current moment
        const currentTime = new Date();
        queryString['Origin.DateTime'] = { $gt: currentTime.toISOString() };

        console.log('Current Time:', currentTime);
        console.log('Query String:', queryString);

        // Fetch cheapest flights based on total price
        const flights = await Flights.find(queryString)
            .sort({ 'Flight.Price.TotalDisplayFare': 'asc' })
            .limit(limit); // Adjust the limit as needed

        res.json({ flights, queryString });
    } catch (error) {
        console.error('Error fetching cheapest flights:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Assuming you have already required the necessary dependencies and defined the Flight model

exports.findDirectFlights = async (req, res) => {
    try {
        const values = req.body.query;
        const limit = req.body.flightsNumber * 4;
        const objPlace = {
            '%city%': 'Origin.CityName',
            '%city2%': 'Destination.CityName',
            '%airline': 'Flight.FlightDetails.Details.0.Operatedbyairlinename',
            '%airport%': 'Origin.AirportName',
            '%airport2%': 'Destination.AirportName',
        };

        let queryString = Object.keys(values).reduce((acc, key) => {
            acc[objPlace[key]] = values[key];
            return acc;
        }, {});

        // Add logic to filter flights with origin time after the current moment and StopsNumber equal to 0
        const currentTime = new Date();
        queryString['Origin.DateTime'] = { $gt: currentTime.toISOString() };
        queryString['StopsNumber'] = 0;

        console.log('Current Time:', currentTime);
        console.log('Query String:', queryString);

        // Fetch direct flights (StopsNumber = 0)
        const flights = await Flights.find(queryString)
            .limit(limit); // Adjust the limit as needed

        res.json({ flights, queryString });
    } catch (error) {
        console.error('Error fetching direct flights:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getFlightsByRoute = async (req, res) => {
    try {
        const { originCode, destinationCode } = req.query;

        // Use Mongoose find method to get flights with the specified origin and destination codes
        const flights = await Flights.find({
            'Flight.FlightDetails.Details.0.Origin.AirportCode': originCode,
            'Flight.FlightDetails.Details.0.Destination.AirportCode': destinationCode,
        });

        res.json({ flights });
    } catch (error) {
        console.error('Error fetching flights:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteAll = async (req, res) => {
    try {
        // Use the deleteMany method to delete all documents in the Flights collection
        const result = await Flights.deleteMany({});

        res.send({
            message: `${result.deletedCount} flights deleted successfully.`,
        });
    } catch (error) {
        console.error('Error deleting flights:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getPriceOfDates = async (req, res) => {
    try {
        // Extract origin and destination codes from query parameters
        const { originCode, destinationCode } = req.query;

        // Fetch flights data from the database based on the origin and destination codes
        const flightsData = await Flights.find({
            'Origin.AirportCode': originCode,
            'Destination.AirportCode': destinationCode
        });

        // Construct JSON response with lowest TotalDisplayFare for each DepartDate
        const lowestPrices = {};
        flightsData.forEach(flight => {
            const departDate = flight.Origin.DateTime.split('T')[0]; // Extracting DepartDate and removing time
            const totalPrice = flight.Flight.Price.TotalDisplayFare; // TotalDisplayFare
            if (!lowestPrices[departDate] || totalPrice < lowestPrices[departDate]) {
                lowestPrices[departDate] = totalPrice; // Storing lowest price for each DepartDate
            }
        });

        // Convert date keys to date strings without the time part
        const formattedPrices = {};
        for (const date in lowestPrices) {
            formattedPrices[new Date(date).toISOString().split('T')[0]] = lowestPrices[date];
        }

        // Send the constructed JSON response
        res.json(formattedPrices);
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}