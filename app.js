const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");

const listing = require("./routes/listing.js");
const reviews = require("./routes/review.js");

main()
.then(() => {
  console.log("Connected to DB");
})
.catch((err) => {
  console.log(err);
});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const flash = require("connect-flash");

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.get("/", (req,res) => {
  res.send("hi, i am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


app.use("/listings", listing);
app.use("/listings/:id/reviews", reviews);


app.all('*', (req,res,next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

//Error handling middleware
app.use((err, req, res, next) => {
  let {statusCode=500, message="Something went wrong!"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("listings/error.ejs", {message});
});

app.listen(8080, () => {
  console.log("Server is listening to the port 8080");
});