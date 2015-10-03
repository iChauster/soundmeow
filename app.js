var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var SoundCloudStrategy = require('passport-soundcloud').Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

/*https://soundcloud.com/connect end user auth
https://api.soundcloud.com/oauth2/token token*/

passport.use(new SoundCloudStrategy({
    clientID: 'bdada4ec105a7128a8b5f8789074517f',
    clientSecret: 'eaf3aeffd63dd5b95af5d2aa78495a66',
    callbackURL: "http://soundmeow.herokuapp.com/auth/soundcloud/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      return done(null, user);
   
  }
));
// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');  

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});*/

app.get('/auth/soundcloud',
  passport.authenticate('soundcloud'));

app.get('/auth/soundcloud/callback', 
  passport.authenticate('soundcloud', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
// error handlers

// development error handler
// will print stacktrace
/*if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}*/
app.get('/' ,function(req,res,next){
  res.render('soundmeow',{user:req.user});
});
// production error handler
// no stacktraces leaked to user
/*app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});*/
app.listen(process.env.PORT || 3000, function(){
  console.log("soundmeow: port : %d in %s", this.address().port, app.settings.env);
});

module.exports = app;

