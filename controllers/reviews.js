const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.getReviewForm = (req, res) => {
    res.redirect(`/campgrounds/${req.params.id}`);
}

module.exports.createReview = async (req,res) => {
    const theCampground = await Campground.findById(req.params.id);
    
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    theCampground.reviews.push(newReview);
    await newReview.save();
    await theCampground.save();
    req.flash('success', 'Thank you for adding your review !')
    res.redirect(`/campgrounds/${theCampground._id}`);
}

module.exports.deleteReview = async (req, res)=> {
     const {id, revId} = req.params;
     await Campground.findByIdAndUpdate(id, {$pull:{reviews: revId}});
     await Review.findByIdAndDelete(revId);
     req.flash('success', 'Your review is deleted')
     res.redirect(`/campgrounds/${id}`);
}