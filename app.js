
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

// require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const campgroundRouter = require('./routes/campgrounds');
const reviewRouter = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRouter = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const dbUrl = process.env.DB_URL;
//const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp'
const MongoDBStore = require('connect-mongo')(session);
const store = new MongoDBStore({
      url: dbUrl,
      secret: 'mySecret',
      touchAfter: 24 * 60 * 60
});

mongoose.connect(dbUrl).then(()=>{
    console.log("connection open !!!");
}).catch(err =>{
    console.log("Error !!!");
    console.log(err);
});


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);
app.set('layout', 'layouts/boilerplate'); //since views folder is already defined so we don't need to set the path for layouts folder


//app.use(express.static('public'));
app.use(express.static(path.join(__dirname,'public'))); //this public directory will be accessed by every ejs file

app.use(express.urlencoded({ extended: true}));

app.use(methodOverride('_method'));

app.use(mongoSanitize());



store.on("error", function(e){
    console.log("Session Store Error", e);
})

app.use(session({
    store,
    name: 'session',
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    //to define other properties of our cookie like expiration date
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(flash());



//passport.session() should always be defined below session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//any object or method (like req.user) created by passport should be used after passport is serialized 
app.use((req, res, next) => {

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


//all the middlewares that should run with every request should be defined above

app.use('/campgrounds', campgroundRouter);
app.use('/campgrounds/:id/reviews', reviewRouter);
app.use('/', userRouter);

app.get('/', (req, res) =>{
    res.render('campgrounds/home');
})

app.get('/makecampground', async (req, res) =>{
    const camp = new Campground({
        title: 'my backyard',
        description: 'cheap camping'
    });

    await camp.save();

    res.send(camp);
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'sk@gmail.com', username: 'sk'});
    const newUser = await User.register(user, 'lol');
    res.send(newUser);
});



app.all('*',(req, res, next)=>{
     next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const {code = 500} = err;
    if (!err.message){
        err.message = 'Page not found :('
    }
    res.status(code).render('error', {err, code});

})

app.listen(3000);