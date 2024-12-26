const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            Flight: Object,
            Origin: Object,
            Destination: Object,
            StopsNumber: Number,
            StopsName: Array,
            Airline: String,
            PricePerTicket: Number,
            createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
        },
        { timestamps: false }
    );

    const Flights = mongoose.model("flights", schema);
    return Flights;
};
