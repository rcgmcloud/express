var express = require('express');
var app = express();
var jade = require('jade');
var path = require('path');
var config = require('./config/config.json');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new RedisStore(),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 10 * 1000
  }
}));

app.use(function (req, res, next){
  var session = req.session;
  if(session.views){
    session.views++;
  }else{
    session.views=1;
  }
  console.log('viewed', session.views, 'times!');
  next();

});

app.get('/', function (req, res) {
  res.render('hello-express');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
