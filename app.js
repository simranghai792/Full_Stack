if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}
// console.log(process.env.SECRET);

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const  listingRouter = require("./routes/listing.js"); 
const reviewRouter = require("./routes/review.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));

app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);  //use ejs-locals for all ejs templates
app.use(express.static(path.join(__dirname,"/public")));

const dbUrl = process.env.ATLASDB_URL;

main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);   
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
}); 

store.on("error",() => {
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized : true,
    cookie: {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

/* Configuring Strategy(Basic settings) */
app.use(passport.initialize()); /* A middleware that intializes passport */
app.use(passport.session());   /* A web application needs the ability to identify users as they browse from page to page.This series of requests and responses, each associated with the same user, is known as session */
/*use static authenticate method of model in LocalStrategy */
passport.use(new LocalStrategy(User.authenticate()));   /* authenticate method is built-in method that adds through passport-local-mongoose by default. */

passport.serializeUser(User.serializeUser()); /* Use to serialize users into the session(stored krvata hai information koh)*/
passport.deserializeUser(User.deserializeUser()); /* Use to deserialize users into the session(Unstored krvata hai information koh) */

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingRouter);   /* Router */
app.use("/listings/:id/reviews", reviewRouter);

app.use("/",userRouter);

app.all("*", (req,res,next) => {
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next) => {
   let {statusCode=500,message="Something Went Wrong!"} = err;
   res.status(statusCode).render("error.ejs",{ err });
});

app.listen(1080, () => {
   console.log("Server is listening to port 1080");
});