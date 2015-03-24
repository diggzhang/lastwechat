var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var superagent = require('superagent');
var cheerio = require('cheerio');

var routes = require('./routes/index');
var users = require('./routes/users');

var config = require('./config');

var API = require('wechat-enterprise-api');

var app = express();
var api = new API(config.corpid, config.corpsecret, 10);

var to = {
    "touser" : "@all"
};

var message = {
    "msgtype" : "news",
    "news" : {
        "articles" : [
            {
                "title":"Title",
                "description":"Description",
                "url":"URL",
                "picurl":"PIC_URL",
            },
            {
                "title":"Title",
                "description":"Description",
                "url":"URL",
                "picurl":"PIC_URL",
            }
        ]
    },
    "safe" : "0"
};

//message.text["content"] = "get rss message";

//Spider

var getRss = function (cb) {
superagent.get('https://cnodejs.org/')
    .end(function (err, sres) {
        if (err) {
            return next(err);
        };

        var $ = cheerio.load(sres.text);
        var items = [];
        
        $('#topic_list .topic_title').each(function (idx, element) {
            var $element = $(element);
            items.push({
                title: $element.attr('title'),
                href: $element.attr('href')
            });
        });
        cb(items);
    })
}

getRss(function (rss) {
   // console.log(rss);
   //message.text.content = rss[0].title + "<br>"  + rss[1].title + "<br>" + rss[2].title;
    var cnodejsUrl = "https://cnodejs.org";
    message.news.articles[0].title = rss[0].title;
    message.news.articles[0].url = cnodejsUrl+rss[0].href;
    message.news.articles[1].title = rss[1].title;
    message.news.articles[1].url = cnodejsUrl+rss[1].href;

    console.log(message.news.articles[0].url);
    console.log(message.news.articles[1].url);
    api.send(to, message, function (err, data, res) {
        if (err) {
            console.error(err);
        };
    });
});


//get user
api.getUser('digg', function (err, data, res) {
//    console.log(data);
})

//push message
/*
api.send(to, message, function (err, data, res) {
//    console.log(data);
    console.log(message.text["content"]);
});
*/
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
