const express = require ('express');
var exphbs  = require('express-handlebars');
const {Pool} = require('pg')
const bodyParsher = require('body-parser')

var app = express();

var connectionString = {
    user: 'postgres',
    host: 'localhost',
    database: 'smsengine_1019',
    password: 'Shittyl@dy1',
    port: 5432,
}

//static files folders
app.use("/js",express.static(__dirname + "/js"));
app.use("/css",express.static(__dirname + "/css"));

//view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


app.get('/', function (req, res) {
    res.render('home');

});

app.get('/home2', function (req, res) {
    res.render('home2');

});

app.get('/:msisdn', function (req, res) {
   // res.render('home3',req.query);
    //res.redirect('/');
    let table = req.query.table;
    let msisdn = req.params.msisdn;
    let datatable = {};

    const pool = new Pool(connectionString);

    pool.query(`Select * from ${table} where msisdn = ${msisdn} order by id`, function(err,res1){
        if(err){
            console.log(err);
            res.send('Error')
        }

        else{
            
            var data = {dataRender: JSON.stringify(res1.rows[0])};
            let dt = {data:res1.rows};
            
            
            pool.end();
            res.json(dt);
        }
        
    })

});



app.listen(4000);