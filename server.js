var express = require('express');
var app = express();
var jade = require('jade');
var path = require('path');
var config = require('./config/config.json');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    var admin = config.admin;
    if (!admin) {
      return done(new Error('No admin configured'));
    }

    if (username !== admin.username) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (password !== admin.password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, admin);

  }
));

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
  store: new RedisStore(),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 10 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next){
  var session = req.session;
  if(session.views){
    session.views++;
  }else{
    session.views = 1;
  }
  console.log('viewed', session.views, 'times!');
  next();
});



app.get('/', function (req, res) {
  res.render('index', {username: req.session.username});
});


app.post('/signup',function (req, res, next){
  req.session.username = req.body.name;
  res.redirect('/');
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/secret',
                                    failureRedirect: '/',
                                    session: false }));

app.get('/secret', function(req, res, next) {
  res.send('SECRET!');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
