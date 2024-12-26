const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.countries = require("./countries.model.js")(mongoose);
db.airlines = require("./airlines.model.js")(mongoose);
db.cities = require("./cities.model.js")(mongoose);
db.webpages = require("./webpages.model.js")(mongoose);
db.page_types = require("./page_types.model.js")(mongoose);
db.languages = require("./languages.model.js")(mongoose);
db.airports = require("./airports.model.js")(mongoose);
db.media = require("./media.model.js")(mongoose);
db.flights = require("./flights.model.js")(mongoose);
db.inquiry = require("./inquiry.model.js")(mongoose);
db.tickets = require("./tickets.model.js")(mongoose);
db.cmsPages = require("./cmsPages.model.js")(mongoose);
db.FAQCategory = require("./faqCategory.model.js")(mongoose);
db.faqArticle = require("./faqArticle.model.js")(mongoose);
db.faqQuestion = require("./faqQuestion.model.js")(mongoose);
db.FAQ = require("./faq.model.js")(mongoose);
db.emailTemplate = require("./emailTemplates.model.js")(mongoose);
db.newsletterSubscriber = require("./newsLetterSubscriber.model.js")(mongoose);
db.blog = require("./blog.model.js")(mongoose);
db.Blogcat = require("./blogcat.model.js")(mongoose);
db.offer =require("./offer.model.js")(mongoose); // add new
db.job =require("./job.model.js")(mongoose); // add new
db.jobApplication = require("./jobApplication.model.js")(mongoose);

module.exports = db;
