const User = require('../models/user');


module.exports.getRegisterForm = (req, res) => {
     res.render('users/register');
}

module.exports.registerUser = async (req, res, next) => {
  try{ 
      const {username, email, password} = req.body;
      const newUser = await new User({username, email});
      const registeredUser = await User.register(newUser, password);
      await registeredUser.save();
      req.login(registeredUser, err => {
        if(err) return next(err);
        req.flash('success', 'Welcome to Yelp-camp !!!');
        res.redirect('/campgrounds');
      });
  }
  catch(e){
      req.flash('error', e.message);
      res.redirect('/register');
  }
}

module.exports.getLoginForm = (req, res) => {
     res.render('users/login');
}

module.exports.loginUser = (req, res) => {
     req.flash('success', 'Welcome back'); 
     const redirectUrl = res.locals.returnTo || '/campgrounds';
     res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You have logged out successfully');
        res.redirect('/campgrounds');
    });
}