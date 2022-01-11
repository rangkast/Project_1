//DB  연결
var db_config = require(__dirname + '/../config/database.js');
var conn = db_config.init();
//var bodyParser = require('body-parser');
db_config.connect(conn);

var express = require('express');
var app = express();
var engines = require('consolidate');
var path = require('path');

//CORS 예외처리
var cors = require("cors");
var allowlist = ['http://10.157.15.19:8080', 'http://10.157.15.19:8082'];
var corsOptions;

const DB_LOAD = 0;
const DB_SAVE = 1;


// router 설정
var indexRouter = require(__dirname);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static('./static/'));

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

//Front server CORS 예외처리
var corsOptionsDelegate = function (req, callback) {
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true }
  } else {
    corsOptions = { origin: false }
  }
  callback(null, corsOptions)
}
app.use(cors(corsOptions));

var axios = require('axios');

app.post('/save', cors(corsOptionsDelegate), (req, res, next) => {
    console.log('/save');
    console.log(req.body);
    postValidateDATA(DB_SAVE, req.body);
});

app.post('/load', cors(corsOptionsDelegate), (req, res, next) => {
    console.log('/load');
    var ret = postValidateDATA(DB_LOAD, 'username');
    var data = {"result": 'ok', "data" :'test'}
    return jsonify(data);
});

//backend(flask) 서버와의 연동
const postValidateDATA = async function(cmd, data) {
    var _user_name = 'none';
    try {
        const response =  await axios.post("http://10.157.15.19:8080/commAPI_flask", {
            content: 'username',
        });
        var obj = response.data;
        console.log(obj);
        if (obj.result == 'success') {                   
            if (obj.data != 'none') {
                _user_name = obj.data;
            }
        } else {
            console.log(obj.result);
        }        
    } catch (error) {
        console.log(error);
    }
    if (_user_name == 'none') {
        console.log('cannot find user');
        return;
    }
    switch (cmd) {
        case DB_SAVE:
            try {   
                conn.query("UPDATE miya_user SET json_data = '" + JSON.stringify(data) + "' WHERE user_username =?",
                [_user_name],
                function(queryError, queryResult){
                    if(queryError){
                        throw queryError;
                    } else {
                        console.log('json data inserted\n');
                    }
                });
            } catch (error) {
                console.log(error);
            }
        break;
     
        case DB_LOAD:        
            try {              
                conn.query('SELECT * FROM miya_user WHERE user_username = ?', 
                [_user_name],
                function (err, rows, fields) {
                    if(err) 
                        console.log('query is not excuted. select fail...\n' + err);
                    else {
                        console.log(rows);
                    }
                });                    
            } catch (error) {
                console.log(error);
            }
        break;
    }//end switch
}//end function

const getValidateDATA = async function(data) {
    var ret;
    try {
        const response =  await axios.get("http://10.157.15.19:8080/commAPI_flask", {
            content: data,
        });
        console.log(response.data);
    } catch (error) {
        console.log(error);
    }
}

app.listen(8081, () => console.log('Server is running on port 8081'));