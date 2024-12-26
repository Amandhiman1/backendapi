function replaceCityAndAirportName(data, originalCity, newCity) {
    // Traverse the data to find and replace "CityName" and "AirportName"
    if (Array.isArray(data)) {
        return data.map(item => replaceCityAndAirportName(item, originalCity, newCity));
    } else if (typeof data === 'object' && data !== null) {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                // Check if both CityName and AirportName match
                if (
                    data["CityName"] === originalCity &&
                    data["AirportName"] === originalCity
                ) {
                    data["CityName"] = newCity; // Replace city name
                    data["AirportName"] = newCity; // Replace airport name
                } else if (typeof data[key] === 'object') {
                    // Recursively traverse nested objects/arrays
                    data[key] = replaceCityAndAirportName(data[key], originalCity, newCity);
                }
            }
        }
    }
    return data;
}

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
                                },
                                "OperatorCode": "SG",
                                "DisplayOperatorCode": "SG",
                                "ValidatingAirline": "",
                                "OperatorName": "SpiceJet",
                                "FlightNumber": "8269",
                                "CabinClass": "",
                                "Operatedby": "",
                                "equipment": null,
                                "Duration": 135,
                                "Attr": {
                                    "Baggage": "15 Kg",
                                    "CabinBaggage": "7 Kg",
                                    "AvailableSeats": 1
                                }
                            }
                        ]
                    ]
                },
                "Price": {
                    "Currency": "USD",
                    "TotalDisplayFare": 51.757,
                    "PriceBreakup": {
                        "BasicFare": 27.649,
                        "Tax": 24.108,
                        "AgentCommission": 0,
                        "AgentTdsOnCommision": 0
                    },
                    "PassengerBreakup": {
                        "ADT": {
                            "BasePrice": 27.649,
                            "Tax": 24.108,
                            "TotalPrice": 51.757,
                            "PassengerCount": "1"
                        }
                    }
                },
                "ResultToken": "d0e7a6da81ee42a78252911aff28ca58*_*2*_*9M0ErCrbPFcCvGzH",
                "Attr": {
                    "IsRefundable": true,
                    "AirlineRemark": "TTMX SALE",
                    "IsLCC": true
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
            },
            "StopsNumber": 0,
            "StopsName": [],
            "__v": 0,
            "Airline": "SpiceJet"
        }
    ],
    "queryString": {
        "Flight.FlightDetails.Details.0.OperatorName": "SpiceJet",
        "StopsNumber": 0,
        "Origin.DateTime": {
            "$gt": "2024-09-21T04:36:08.185Z"
        },
        "Origin.CityName": "Delhi",
        "Destination.CityName": "Mumbai"
    }
};

// Replace "CityName": "Delhi" with "CityName": "Nueva Delhi"
const updatedFlightData = replaceCityAndAirportName(flightData, "Delhi", "Nueva Delhi");

// console.log(JSON.stringify(updatedFlightData));


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

const replacements = [
    { key: "CityName", value: { old: "Delhi", new: "Nueva Delhi" } },
    { key: "CityName", value: { old: "Mumbai", new: "Bombay" } },
    { key: "AirportName", value: { old: "Delhi", new: "Nueva Delhi" } },
    { key: "AirportName", value: { old: "Mumbai", new: "Bombay" } },
    { key: "OperatorName", value: { old: "SpiceJet", new: "SpiceJet Airways" } }
];

// Apply the replacements
const updatedFlightDataMultipleKeys = replaceMultipleKeys(flightData, replacements);
console.log(JSON.stringify(updatedFlightDataMultipleKeys));