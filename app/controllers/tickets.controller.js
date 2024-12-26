const db = require("../models");
const Ticket = db.tickets;
const {sendEmail} = require('../utils/email');

exports.createTicket = async (req, res) => {
  try {
    const { email, subject, description, number } = req.body;

    // Save contact help request data
    const data = new Ticket({
      email: email,
      subject: subject,
      description: description,
      number: number,
      status: 'Open'
    });
    const saveData = await data.save();

    // Send email to user
    await sendEmail(email, 'Contact Help Request Received', 'Your contact help request has been received. We will get back to you soon.');

    res.status(201).json({ message: "Data saved successfully", data: saveData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};

exports.getTicket = async (req, res) => {
  const page = parseInt(req.params.page) || 1; // Default to page 1 if page parameter is not provided
  const limit = 5; // Number of tickets per page

  try {
    const count = await Ticket.countDocuments({});
    const totalPages = Math.ceil(count / limit);

    const tickets = await Ticket.find({})
      .sort({ createdAt: -1 }) // Sort by creation date in descending order (latest first)
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    res.json({
      tickets: tickets,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};

exports.getTicketById = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Ticket.findById(id);

    if (!data) {
      return res.status(404).json({ message: "data not found" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};

exports.TicketDeleteById = async (req, res) => {
  const id = req.params.id;
  try {
    // console.log(id);
    const data = await Ticket.findOneAndDelete({ _id: id }, req.body);
    res.status(201).json({ message: "Data delete Successful", data });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const newStatus = req.body.status;

    // Find the ticket by ID
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update the status
    ticket.status = newStatus;
    ticket.updatedBy= req.user._id;
    const updatedTicket = await ticket.save();

    await sendEmail(ticket.email, 'Contact ticket closed', 'Your contact help request ticket has been closed.');

    res.status(200).json({ message: "Ticket status updated successfully", data: updatedTicket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
}