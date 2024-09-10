const mongoose = require('mongoose');
const { campgroundSchema } = require('../JoiSchemas');
const schema = mongoose.Schema;
const Review = require('./review');


const opts = { toJSON: {virtuals: true}};

const ImageSchema = new schema({
    url: String, 
    filename: String
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new schema({
    title: String,
    price: Number,
    // image: String,
    images: [ImageSchema],
    description: String,
    geometry:{
      type:{
          type: String,
          enum: ['Point']
      },
      coordinates:{
          type: [Number]
      }
    },
    location: String,
    reviews: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'review'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `${this.title}`;
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
       if(doc){
             await Review.deleteMany({
                  _id: { $in: doc.reviews}
             })
       }
});

module.exports = mongoose.model('Campground', CampgroundSchema);

