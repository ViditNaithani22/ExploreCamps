const mongoose = require('mongoose');
const cities = require('./cities')
const {descriptors, places} = require('./seedHelpers')
const Campground = require('../models/campground');
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl).then(()=>{
    console.log("connection open !!!");
}).catch(err =>{
    console.log("Error !!!");
    console.log(err);
});

const sample = (array) => array[Math.floor(Math.random() * array.length)]; 

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 100; i++){
        let randomCity = Math.floor(Math.random()*1000);
        let randomPrice = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: `https://picsum.photos/400?random=${Math.random()}`,
            geometry:{
                  type: 'Point',
                  coordinates: [cities[randomCity].longitude, cities[randomCity].latitude]
            },
            images: [
                      {
                         url: 'https://res.cloudinary.com/dzmcbgayu/image/upload/v1725135923/YelpCamp/znjclacyfzppufylqzdw.webp',
                         filename: 'YelpCamp/znjclacyfzppufylqzdw'
                      },
                      {
                         url: 'https://res.cloudinary.com/dzmcbgayu/image/upload/v1725135923/YelpCamp/lifu9giivomq3o33dvks.jpg',
                         filename: 'YelpCamp/lifu9giivomq3o33dvks'
                      }
                    ],
            description: "Nestled within the serene embrace of a lush forest, Whispering Pines Campground offers an idyllic retreat for nature enthusiasts and adventure seekers alike. This hidden gem, surrounded by towering pines and vibrant wildflowers, provides the perfect backdrop for a peaceful escape from the hustle and bustle of everyday life.",
            price: randomPrice,
            author: '66dee1aa6683509d54796e28'
        }) 
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close()
});
