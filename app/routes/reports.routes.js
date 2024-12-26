// Call Request Summary Report
// Total call requests.
// Filter API on every fields
// Closed vs. open requests.
// IP block statistics.

module.exports = app => {
    const { authenticateToken, authorizePermissions } = require("../middleware/auth");
    let router = require("express").Router();

    const reportController = require('../controllers/reports.controller');

    router.post('/prime-flight-deals', reportController.getPrimeFlightDeals);
    router.post('/top-flights', reportController.getTopFlightRoutes);
    router.post('/popular-destinations', reportController.getPopularDestinations);
    router.post('/inspire-next-getaway', reportController.getNextGetawayInspiration);
    router.post('/last-minute-flight', reportController.lastMinuteFlights);
    router.post('/airlines', reportController.airlinesFlights);

    router.post('/flights-by-destination-type', reportController.findFlightsByDestinationType);
    router.post('/fastest-flight', reportController.findFastestFlight);
    router.post('/longest-flight', reportController.findLongestFlight);
    router.post('/connecting-flights', reportController.findConnectingFlights);
    router.post('/flights-from-location', reportController.findFlightsFromLocation);
    // One-way and return flights-- type="one-way" OR type="return"
    router.post('/flights-to-location', reportController.findFlightsToLocation);
    // Route for fetching airlines flying between origin and destination
    router.post('/airlines-flying', reportController.findAirlinesFlying);
    // route for fetching airline flights to a location (city or country)
    router.post('/airline-flights-to-location', reportController.findAirlineFlightsToLocation);
    // route for fetching flights between various locations(city to city, city to country, country to city, country to country)
    router.post('/flights-between-locations', reportController.findFlightsBetweenLocations);
    // route for listing flights by airline
    router.post('/flights-by-airline', reportController.listFlightsByAirline);
    // route for fetching flights between various locations for a specific airline(city to city, city to country, country to city, country to country)
    router.post('/airline-flights-between-locations', reportController.findAirlineFlightsBetweenLocations);
    // route for fetching airline direct flights to a location (city or country)
    router.post('/airline-direct-flights-to-location', reportController.findAirlineDirectFlightsToLocation);
    // route for fetching airline direct flights between locations
    router.post('/airline-direct-flights-between-locations', reportController.findAirlineDirectFlightsBetweenLocations);
    // route for fetching airline connecting flights
    router.post('/airline-connecting-flights', reportController.findAirlineConnectingFlights);
    // route for fetching one-way flights
    router.post('/one-way-flights', reportController.findOneWayFlights);
    // route for fetching return flights
    router.post('/return-flights', reportController.findReturnFlights);


    app.use("/api/reports", router);
}






// ======================    API CREATED ==========================================================
// ========================================
// flight from city 
// flight from country 
// flight from continent 
// direct flight from location

// ============================================
// Latest flights-  latest search and sort by price
// cheapest flight - sort by price
// fastest flight - sort by time
// Longest flight - sort by distance
// direct flights - sort by direct flights
// connecting flights- sort by connecting flights
// airline fly's-> sort by airline

// flight to city
// direct flight to city 
// flight to country 
// flight to continent 

// one way flight to city
// return flgith to city 

// airline flight to city 
// airline flight to country 

// flight from city to city 
// flight from country to country 
// flight from city to country
// flight from country to city 

// by airline
// airline direct flight  
// airline city to city 
// airline from country to country 
// airline from city to country
// airline from country to city 


// direct flight to country
// direct flight from city to city 
// direct flgiht from country to country 
// direct flight from city to country 
// direct flight from country to city 

// airline direct flight to city 
// airline direct flight to country

// airline direct flight from city to city 
// airline direct flgiht from country to country 
// airline direct flgiht from city to country
// airline direct flgiht from country to city.

// airline connecting flight 
// airline connecting flight to city 
// airline connecting flight to country  
// airline connecting flgiht from city to country 
// airline connecting flgiht from country to city


// one way flight from city to city 
// return flgiht from ciity to city 
// one way flight to country 
// return flight to country 
// one way flight from city to city 
// return flight from city to city 
// one flight from city to country
// return flight from city to country
// one way flight from country to city 
// return flight from country to city 