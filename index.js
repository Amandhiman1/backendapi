const mongoose = require('mongoose');
mongoose.set('strictQuery', true)

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const crypto = require("crypto");


var corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001", "https://flight-liard.vercel.app"],
  credentials: true
};

app.use(cors(corsOptions));

var multer = require("multer");
// Set storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // The uploaded files will be stored in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename for each uploaded file
  },
});

const upload = multer({ storage }); // 'image' should match the field name used in the front-end

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));


const secretKey = crypto.randomBytes(32).toString("hex");

app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: { path: '/', secure: false, maxAge: 3600000 }, // 1 hour in milliseconds
  })
);

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to flight_booking_website application." });
});

require("./app/routes/airlines.routes")(app);
require("./app/routes/countries.routes")(app);
require("./app/routes/webpages.routes")(app);
require("./app/routes/page_types.routes")(app);
require("./app/routes/languages.routes")(app);
require("./app/routes/cities.routes")(app);
require("./app/routes/airports.routes")(app);
require("./app/routes/flights.routes")(app);
require("./app/routes/inquiry.routes")(app);
require("./app/routes/tickets.routes")(app);
require("./app/routes/faqCategory.routes")(app);
require("./app/routes/faqQuestion.routes")(app);
require("./app/routes/faqArticle.routes")(app);
require("./app/routes/admin.routes")(app);
require("./app/routes/newsletterSubscriber.routes")(app);
require("./app/routes/emailTemplate.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/tasks.routes")(app);
require("./app/routes/media.routes")(app, upload);
require("./app/routes/blogRoutes.routes")(app, upload);
require("./app/routes/blogcategory.routes")(app);
require("./app/routes/offer.routes")(app, upload);     // add new
require("./app/routes/jobRoutes.routes")(app);
require("./app/routes/reports.routes")(app);
require("./app/routes/jobApplication.routes")(app, upload);
require("./app/routes/reportTask.routes")(app); // Newly added reportTask routes

app.use("/images", express.static(__dirname + "/uploads/"));
app.use("/cv", express.static(__dirname + "/uploads_cv/"));

// set port, listen for requests
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
