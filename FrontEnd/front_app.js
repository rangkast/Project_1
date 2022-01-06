
var db_config = require(__dirname + '/config/database.js');
var conn = db_config.init();
var bodyParser = require('body-parser');

db_config.connect(conn);

var express = require('express');
var app = express();
var engines = require('consolidate');
var path = require('path');

// router 설정
var indexRouter = require(__dirname);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/static", express.static('./static/'));

// view 경로 설정
app.set('views', __dirname + '/views');

// 화면 engine을 html로 설정
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.use('/', indexRouter);
module.exports = app;

app.get('/list', function (req, res) {
    var sql = 'SELECT * FROM miya_user';    
    conn.query(sql, function (err, rows, fields) {
        if(err) 
            console.log('query is not excuted. select fail...\n' + err);
        else 
            res.render('list.ejs', {list : rows});
    });
});

app.listen(8081, () => console.log('Server is running on port 8081'));