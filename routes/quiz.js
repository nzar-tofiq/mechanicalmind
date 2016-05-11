var path = require('path');
var fs = require('fs');
var util = require('util');
var uploadedData = process.cwd() + '/db/';
var app = require('express');
var json2csv = require('json2csv');

/*
* GET data in csv format
*/
exports.csvData = function(req, res, next){
  if(!req.params.slug) return next(new Error('No Quiz selected'))
  var data, i, j, k;
  req.models.Quiz.findOne({slug: req.params.slug}, function(err, q) {
    req.models.QuizRecord.find({quiz_id: q._id}, function(err, qrec) {
      if(err) return next(new Error(err));
      data = {name: 'Participants/Answers'};
      data.participants = [];
      for(i = 0; i < qrec.length; i++){
        participant = {name : qrec[i].participant_id}
        participant.tasks = [];
        for(j=0; j< qrec[i].task_record.length; j++){
          task = {name : 'Task ' + Number(j+1)}
          task = qrec[i].task_record[j];
          participant.tasks.push(task);
        }
        data.participants.push(participant);
      };
      data.tasks = [];
      for(k = 0; k > q.tasks.length; k++){
        t = 'Task ' + Number(k+1)
        data.tasks.push(t)
      }
      req.session.quiz = q;
      req.session.data = data;
      json2csv({Experiment: q, data: data}, function(err, csv) {
        if(err) return next(new Error(err));
        res.send(csv)
      });
    });
  });
}

/*
* GET data in JSON format
*/
exports.jsonData = function(req, res, next){
  if(!req.params.slug) return next(new Error('No Quiz selected'))
  var data, i, j, k;
  req.models.Quiz.findOne({slug: req.params.slug}, function(err, q) {
    req.models.QuizRecord.find({quiz_id: q._id}, function(err, qrec) {
      if(err) return next(new Error(err));
      data = {name: 'Participants/Answers'};
      data.participants = [];
      for(i = 0; i < qrec.length; i++){
        participant = {name : qrec[i].participant_id}
        participant.tasks = [];
        for(j=0; j< qrec[i].task_record.length; j++){
          task = {name : 'Task ' + Number(j+1)}
          task = qrec[i].task_record[j];
          participant.tasks.push(task);
        }
        data.participants.push(participant);
      };
      data.tasks = [];
      for(k = 0; k > q.tasks.length; k++){
        t = 'Task ' + Number(k+1)
        data.tasks.push(t)
      }
      req.session.quiz = q;
      req.session.data = data;
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({Experiment: q, data: data}));
    });
  });
}

/*
* Get quiz data
*/
exports.data = function(req, res, next) {
  if(!req.params.slug) return next(new Error('No Quiz selected'))
  var data, i, j;
  req.models.Quiz.findOne({slug: req.params.slug}, function(err, q) {
    req.models.QuizRecord.find({quiz_id: q._id}, function(err, qrec) {
      if(err) return next(new Error(err));
      data = {name: 'Participants/Answers'};
      data.participants = [];
      for(i = 0; i < qrec.length; i++){
        participant = {name : qrec[i].participant_id}
        participant.tasks = [];
        for(j=0; j< qrec[i].task_record.length; j++){
          task = {name : 'Task ' + Number(j+1)}
          task = qrec[i].task_record[j];
          participant.tasks.push(task);
        }
        data.participants.push(participant);
      };
      data.tasks = [];
      req.session.quiz = q;
      req.session.data = data;
      res.render('data/table', {data: data, quiz: q});
    });
  });
}

/*
 * GET quizparams page
 */
exports.create = function(req, res, next) {
  res.render('create');
};

/*
 * Post postParams
 */
exports.add = function(req, res, next) {
  var quiz, t, tIds = [], r, ax, an, bx, bn, nn, expFile, cssText, images;
  if (!req.session.userid) return next(new Error('No slug, data or img path sent'));

  //get the experiment data file and sort images
  expFile = JSON.parse(fs.readFileSync(uploadedData + req.body.pathtodata, 'utf8'));
  cssText = fs.readFileSync(uploadedData + req.body.pathtocss);
  images = fs.readdirSync(uploadedData + req.body.pathtoimg);
  // sort the images
  // http://stackoverflow.com/questions/15478954/sort-array-elements-string-with-numbers-natural-sort
  function naturalCompare(a, b) {
      ax = [], bx = [];
      a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
      b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
      while(ax.length && bx.length) {
          an = ax.shift();
          bn = bx.shift();
          nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
          if(nn) return nn;
      }
      return ax.length - bx.length;
  }
  images.sort(naturalCompare);
  req.session.images = images;

  quiz = new req.models.Quiz({
    slug            : req.body.slug,
    owner_id        : req.session.userid,
    css_path        : req.body.pathtocss,
    img_path        : req.body.pathtoimg,
    data_path       : req.body.pathtodata,
    title           : expFile.title,
    style           : cssText,
    timeout         : expFile.timeout,
    show_timer      : expFile.showtimer,
    randomize       : expFile.randomize,
    quiz_record_ids : [],
    tasks           : [],
    images          : images,
    published       : false
  });
  quiz.save(function(err, q) {
    if (err) return next(new Error(err));
    req.session.quiz = q;
  });
  req.models.Quiz.findOne({_id: quiz._id}, function(err, quiz){
    for (var i=0; i < expFile.tasks.length; i++){
      t = new req.models.Task({
        quiz_id   : quiz._id,
        text      : expFile.tasks[i].text,
        img       : '/img/' +  req.session.images[i],
        responses : expFile.tasks[i].responses,
        solution  : expFile.tasks[i].solution
      });
      t.save(function(err, task){
        if (err) return next(new Error(err));
      });
      quiz.tasks[i] = t._id;
    }
    quiz.save(function(err, data){
      if(err) return next(new Error(err));
    });
    req.session.quiz = quiz;
    res.render('edit', {quiz: req.session.quiz})
  });
};

/*
* POST edit Quiz route
*/
exports.edit = function (req, res, next) {
  if (!req.session.quiz) return next(new Error('No quiz in session.'));
  req.models.Quiz.findOne({_id: req.session.quiz._id}, function(err, quiz) {
    quiz.tasks      = req.session.tasks;
    quiz.title      = req.body.title;
    quiz.slug       = req.body.slug;
    quiz.style      = req.body.style;
    quiz.img        = req.body.img;
    quiz.timer      = req.body.timer;
    quiz.show_timer = req.body.showtimer;
    quiz.randomize  = req.body.randomize;
    quiz.save(function(err) {
      if (err) return next(new Error(err));
      res.redirect('/quiz/edit/task/1');
    });
  });
}

/*
* GET Task page
*/
exports.task = function(req, res, next) {
  // http://www.summa.com/blog/avoiding-callback-hell-while-using-mongoose
  if(!req.session.quiz && !req.params.num) next(new Error('No slug or task number'));
  var tNth = Number(req.params.num) - 1;
  req.models.Task.findOne({_id: req.session.quiz.tasks[tNth]},
    function(err, t) {
      if (err) return next(new Error(err));
      t.num = tNth + 1;
      res.render('task', {task:  t});
  });
};

/*
* Serve image
*/
exports.getImage = function(req, res, next){
  res.sendFile(path.join(uploadedData + '/' + req.session.quiz.img_path, req.params.img));
};

/*
* POST posttask
*/
exports.editTask = function(req, res, next) {
  var taskNum = Number(req.params.num), i;
  if(!req.session.quiz) return next(new Error('Login first'));
  if(taskNum < req.session.quiz.tasks.length){
    req.models.Task.findOne({_id: req.session.quiz.tasks[taskNum - 1]},
      function(err, task) {
      if (err) return next(new Error(err));
      task.text = req.body.text;
      task.solution = req.body.solution;
      for(i = 0; i < task.responses; i++){
        task.responses[i] = req.body.i;
      }
      task.save(function (err, task) {
        if (err) return next(new Error(err));
      });
    });
    taskNum += 1;
    res.redirect('/quiz/edit/task/' + taskNum );
  }else{
    res.redirect('/admin');
  }
}

/*
* GET Quizes
*/
exports.getquizes = function(req, res, next){
  req.models.Quiz.find({},function(err, quizes) {
    if (err) return next(new Error(err));
    res.render('index', {quizes: quizes});
  }).limit(50);
};

/*
* GET Admin route
*/
exports.admin = function(req, res, next){
  req.models.Quiz.find({},function(err, quizes) {
    if (err) return next(new Error(err));
    res.render('admin', {quizes: quizes});
  }).limit(50);
};

/*
* Remove quizes route
*/
exports.remove = function(req, res, next){
  if (!req.params.id) return next(new Error('No quiz ID.'));
  req.models.Quiz.findById(req.params.id, function(err, quiz) {
    if (err) return next(new Error(err));
    quiz.remove(function(err, quiz){
      if (err) return next(new Error(err));
      res.sendStatus(200);
    });
  });
};
