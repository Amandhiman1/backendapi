const db = require("../models");
const Offer = db.offer;

// Create a new offer
exports.createOffer = async (req, res) => {
    try {
        const { from, to, price, airline, travelDate, salesValid, bagAllot, policy, cabin, cancelFees, changeFees,desc } = req.body;
        const image = req.file ? req.file.filename : null;

        const newOffer = new Offer({
            from,
            to,
            price,
            airline,
            travelDate,
            salesValid,
            bagAllot,
            policy,
            cabin,
            image,
            createdBy: req.user.id,
            cancelFees,
            changeFees,
            desc
        });

        await newOffer.save();
        res.status(201).json(newOffer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all offers
exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find();
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single offer by id
exports.getOfferById = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.json(offer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update an offer by id
exports.updateOfferById = async (req, res) => {
    try {
        const { from, to, price, airline, travelDate, salesValid, bagAllot, policy, cabin, updatedBy, cancelFees, changeFees,desc } = req.body;
        const image = req.file ? req.file.filename : null;

        const updateFields = { 
            from,
            to,
            price,
            airline,
            travelDate,
            salesValid,
            bagAllot,
            policy,
            cabin,
            updatedBy,
            cancelFees,
            changeFees,
            desc
            
        };

        if (image) {
            updateFields.image = image;
        }

        const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, updateFields, { new: true });

        if (!updatedOffer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        res.json(updatedOffer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete an offer by id
exports.deleteOfferById = async (req, res) => {
    try {
        const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
        if (!deletedOffer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.json({ message: 'Offer deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
