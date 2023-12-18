const passport = require('passport');

exports.loginGoogle = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleCallback = passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
});

exports.loginFacebook = passport.authenticate('facebook');

exports.facebookCallback = passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/login'
});

