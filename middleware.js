const Campground = require('./models/campground');
const Review = require('./models/review');
const {campgroundSchema} = require('./JoiSchemas');
const ExpressError = require('./utils/ExpressError');
const {reviewSchema} = require('./JoiSchemas');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // add this line
        req.flash('error', 'You are not Logged in !');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
        
        const {error} = campgroundSchema.validate(req.body);
        // if(!req.body.campground){
        //     throw new ExpressError('Invalid campground data', 400);
        // }

        //error object will not be in the returned object if there is no error 
        if(error){
            //details is an array of objects, therefore we need to go through each element using map() method
            const msg = error.details.map(el => el.message).join(', ');
            throw new ExpressError(msg, 400);
        }
        else{
            next();
        }
}


module.exports.validateAuthor = async (req, res, next) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp.author.equals(req.user._id)){
       req.flash('error', 'You are not authorized to make changes in this campground');
       return res.redirect(`/campgrounds/${id}`); 
    }
    next();
}

module.exports.validateReviewAuthor = async (req, res, next) => {
    const {revId, id} = req.params;
    const review = await Review.findById(revId);
    if(!review.author.equals(req.user._id)){
       req.flash('error', 'You are not authorized to make changes in this review');
       return res.redirect(`/campgrounds/${id}`); 
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}
