module.exports = app => {
    const flights = require("../controllers/flights.controller.js");

    var router = require("express").Router();

    // Create a new flight
    router.post("/oneway/add", flights.create);
    router.post("/oneway/findBySlug", flights.findBySlug);
    router.post("/latest-flights", flights.getLatestFlights);
    router.post("/cheapest-flights", flights.findCheapestFlights);
    router.post("/direct-flights", flights.findDirectFlights);
    router.delete("/oneway/delete-all", flights.deleteAll);
    router.get("/oneway/find", flights.getFlightsByRoute);
    router.get("/get-prices", flights.getPriceOfDates);

    app.use("/api/flights", router);
    
};
