'use strict'
var express = require('express');
var errorHandler = require('errorhandler');
var fs = require('fs');
var http = require('http');
var jade = require('jade');
var path = require('path');
var util = require('util');
var session = require('express-session');
var logger = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var models = require('./models');
var routes = require('./routes');
mongoose.connect('mongodb://localhost/mm');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(data) {});
var app = express();
app.set('appName', 'mechanicalmind');
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Modells middleware
app.use(function(req, res, next) {
  if (!models.User) return next(new Error("No User models."));
  if (!models.Quiz) return next(new Error("No Quiz models"));
  if (!models.Participant) return next(new Error("No Participant models"));
  if (!models.Task) return next(new Error("No Task models"));

  req.models = models;
  return next();
});

//session middleware
app.use(function(req, res, next) {
  if (req.session)
    if(req.session.usertype)
      res.locals.usertype = req.session.usertype;
  next();
});

app.use(session({
  secret: 'MM-UNIVERSITY-OF-BRIGHTON-MM',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false},
}));

app.use(function(req, res, next) {
  if (req.session && req.session.admin)
    res.locals.admin = true;
  next();
});

// Authorisation
var authorize = function(req, res, next) {
  if (req.session.userid && req.session.admin){
    return next();
  } else {
    res.sendStatus(401);
  }
};

// Pages and routes
app.get('/', routes.quiz.getquizes);
app.get('/login', routes.user.login);
app.get('/logout', routes.user.logout);
app.get('/exp/:slug/participant', routes.participant.register);
app.post('/exp/:slug/register', routes.participant.add);
app.get('/exp/:slug/task/:num', routes.participant.task);
app.get('/exp/:slug/task/:num/response/:res', routes.participant.answer)
app.post('/login', routes.user.authenticate);
app.get('/admin', authorize, routes.quiz.admin);
app.get('/quiz/create', authorize, routes.quiz.create);
app.post('/quiz/create', authorize, routes.quiz.add);
app.post('/quiz/edit', authorize, routes.quiz.edit)
app.get('/quiz/edit/task/:num', authorize, routes.quiz.task);
app.post('/quiz/edit/task/:num', authorize, routes.quiz.editTask);
app.get('/data/:slug', authorize, routes.quiz.data);
app.get('/data/:slug/json', authorize, routes.quiz.jsonData);
app.get('/data/:slug/csv', authorize, routes.quiz.csvData);
app.get('/img/:img', routes.quiz.getImage);
app.get('/help', function(req, res, next) {
  if (req.session.userid && req.session.admin){
    res.render('help/experimenter');
  } else {
    res.render('help/participant');
  }
});
app.get('/admin/a', authorize, routes.user.register);
app.post('/a', authorize, routes.user.add);
// app.get('/users', authorize, routes.user.list);
// app.get('/uploadfile', authorize, routes.quiz.uploadfile);
// app.get('/revise', authorize, routes.quiz.getrevise);

// REST API routes
app.get('/api', authorize);
app.delete('/api/quizes/:id', authorize, routes.quiz.remove);
// app.post('/api/updateuser/:id', routes.participant.update);
// app.post('/api/uploadfile', authorize, upload.single('file'), routes.quiz.add);




// Development only
if (app.get('env') === 'development') {
  app.use(errorHandler());
}

//Production
//https://www.npmjs.com/package/express-session
if (app.get('env') === 'production'){
  app.set('trust proxy', 1);
  sessionOptions.cookie.secure = true;
}

app.get('*', function(req, res){
  res.sendStatus(404);
});

//express server
var server = http.createServer(app);

var boot = function () {
  server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
  });
};

var shutdown = function() {
  server.close();
};

if (require.main === module) {
  boot();
} else {
  console.info('Running app as a module');
  module.exports.boot = boot;
  module.exports.shutdown = shutdown;
  module.exports.port = app.get('port');
};
