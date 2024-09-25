const Listing = require("../models/listing.js");

module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs",{ allListings });
};

module.exports.renderNewForm = (req,res) => {      
    res.render("listings/new.ejs");
};

module.exports.createListing = async(req,res,next) => {
    // let {title,description,image,price,country,location} = req.body;
    //abb joh syntax hogya voh bii chotta hogya jbb humne "object and key" form mai dii name attribute mai values 

    // if(!req.body.listing){    /*Client kii glti ki vajah seh error aaya kuki usne title,description etc. fill nhi kiye */
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;  /* jbb loginUser(current user) new listing create krr raha hai, uski id stored krva dehgye taaki humme pta chle kiii kisne new listing craete krri hai */
    newListing.image = {url,filename};
    await newListing.save();
    req.flash("success","New Listing is Created");
    res.redirect("/listings");
};

module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}, }).populate("owner");  /* populate isliye likha, taaki reviews,owner show krr skhe page prr. */

    if(!listing){
        req.flash("error","Listing you requested for doesnot exist");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing});
};

module.exports.renderEditForm = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for doesnot exist");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});   //we can access the listing object by req.body.listing

    if(typeof req.file !== "undefined"){
     let url = req.file.path;
     let filename = req.file.filename;
     listing.image = { url,filename };
     await listing.save();
    }
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);  //show route
};

module.exports.destroyListing = async(req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);   /* Jbb hum particular listing koh delete krre gye, toh voh uske corresponding reviews koh bii delete krregya with the help of "Post Mongoose middleware" */
    console.log(deletedListing);
    req.flash("success","Listing is Deleted");
    res.redirect("/listings");
};