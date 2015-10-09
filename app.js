var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var SC = require('node-soundcloud');
var SoundCloudStrategy = require('passport-soundcloud').Strategy;
var callback = 'http://soundmeow.herokuapp.com/auth/soundcloud/callback';
var request = require('request');
var routes = require('./routes/index');
var users = require('./routes/users');
//var mow = require('soundcloud');
var tracknumber = '"https://soundcloud.com/george-and-jonathan/crystal"';
var profileID;
/*mow.initialize({
  client_id : process.env.SOUNDCLOUD_CLIENT_ID,
  redirect_uri : callback
});*/
passport.use(new SoundCloudStrategy({
    clientID: process.env.SOUNDCLOUD_CLIENT_ID,
    clientSecret: process.env.SOUNDCLOUD_CLIENT_SECRET,
    callbackURL: callback
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    profileID = profile.id;
    SC.init({
      id:process.env.SOUNDCLOUD_CLIENT_ID,
      secret:process.env.SOUNDCLOUD_CLIENT_SECRET,
      uri:callback,
      accessToken:accessToken
    });
      return done(null, profile);
   
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
var app = express();

/*https://soundcloud.com/connect end user auth
https://api.soundcloud.com/oauth2/token token*/


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
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

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
app.get('/search/query', function(req,res){
    var song1;
    var query = req.query['genre'];
    console.log(query);
    var queryEncoded = encodeURIComponent(query);
    request('https://api-v2.soundcloud.com/search?q='+queryEncoded+'&facet=model&user_id='+profileID+'&limit=10&offset=0&linked_partitioning=1&client_id='+process.env.SOUNDCLOUD_CLIENT_ID+'&app_version=a089efd', 
      function (error,response,body){
        if(!error){
          var main = JSON.parse(body);
          if (!main['collection'][0]){
            for (tracks in main['collection']){
              if (main['collection'][tracks]){
                console.log(main['collection'][tracks]['embeddable_by'])
                song1 = main['collection'][tracks]['permalink_url'];
                break;
              }
            }
          }else{          
            song1 = main['collection'][0]['permalink_url'];
          }
          console.log(main['collection'][0]);
          console.log(song1);
          var song = "'" + song1 + "'";
          if(song == null){
            console.log('error, song is nil');
          }else {
            tracknumber = song;
          }
          res.redirect('/');
        }
      });
   //should return to home page with the id of the playlist. 
   
});
app.get('/' ,function(req,res,next){
  console.log(tracknumber);
  res.render('soundmeow',{user:req.user, trackNumber:tracknumber, clientID:process.env.SOUNDCLOUD_CLIENT_ID});
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

