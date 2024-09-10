const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground');
const mbxgeo = require("@mapbox/mapbox-sdk/services/geocoding"); 
const mbxtok = process.env.MAPBOX_TOKEN; 
const geocoder = mbxgeo({ accessToken: mbxtok});

module.exports.index = async (req, res) => {
          const campgroundz = await Campground.find({});
          res.render('campgrounds/index', {campgroundz});
}

module.exports.renderNewForm = (req,res) => {
        res.render('campgrounds/new');
}

module.exports.createCampground = async (req,res, next) => {
        const geodata = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1 
        }).send();
        const newCamp = new Campground(req.body.campground);
        newCamp.geometry = geodata.body.features[0].geometry;
        newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename}));
        newCamp.author = req.user._id;
        await newCamp.save();
        req.flash('success', 'successfully created a new campground !!!');
        res.redirect(`/campgrounds/${newCamp._id}`);
}

module.exports.showCampground = async (req, res) => {
          const camp = await Campground.findById(req.params.id).populate({ 
            path: 'reviews',
            populate: {
                path: 'author'
            }
          }).populate('author');
          if(!camp){
            req.flash('error', 'The campground does not exist');
            return res.redirect('/campgrounds');
          }
          res.render('campgrounds/show', {camp});
}

module.exports.renderEditForm = async (req, res) => {
     const {id} = req.params;
     const camp = await Campground.findById(id);
     if(!camp){
            req.flash('error', 'The campground does not exist');
            return res.redirect('/campgrounds');
        }
     res.render('campgrounds/edit', {camp});
}

module.exports.editCampground = async (req, res, next) => {
    const {id} = req.params;
    const updated = await Campground.findByIdAndUpdate(id, req.body.campground);
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename}));
    updated.images.push(...imgs);
    await updated.save();
    if(req.body.deleteImages){
      for( let file of req.body.deleteImages){
          await cloudinary.uploader.destroy(file);
      }
      await updated.updateOne({ $pull: { images:{ filename: { $in: req.body.deleteImages}}}});
    }
    req.flash('success', 'successfully updated campground');
    res.redirect(`/campgrounds/${updated._id}`);
}

module.exports.deleteCampground = async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Your campground is deleted')
    res.redirect(`/campgrounds`);
}