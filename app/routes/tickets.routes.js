
module.exports = (app) => {
  const { authenticateToken } = require("../middleware/auth");
  const multer = require("multer");
  const Tickets = require("../controllers/tickets.controller");
  const path = require('path');
  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", Tickets.createTicket);
  router.get("/:page", authenticateToken, Tickets.getTicket);
  router.get("/:id", authenticateToken, Tickets.getTicketById);
  router.delete("/:id", authenticateToken, Tickets.TicketDeleteById);
  router.put('/tickets/:ticketId/status', authenticateToken, Tickets.updateTicketStatus);

  app.use("/api/contact-help-you", router);
};
