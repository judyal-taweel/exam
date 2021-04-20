'use strict';

// import all packages we need
require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodoverride = require('method-override');
// const { query } = require('express');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
app.set('view engine', 'ejs');
app.use(express.static('./public/'));
app.use(express.urlencoded({ extended: true }))
app.use(methodoverride('_method'));
//---------------------------------------------------------

app.get('/' ,indexhandle);
app.get('/addFav' ,getFav);
app.get('/details/:id' ,detailspage);
app.get('/create' ,getcreate);
// app.get('/create' ,getcreatedata);
app.post('/addFav' ,favhandle);
app.delete('/details/:id' ,deletedetails);
app.put('details/:id' ,updatedetails);
app.post('/create' ,createchar);

//---------------------------------------------------------

function Char(data){
    this.name = data.name;
    this.house=data.house;
    this.patronus=data.patronus;
    this.alive=data.alive;
}


function indexhandle(req,res){
    let url = 'http://hp-api.herokuapp.com/api/characters';
    superagent.get(url).then(results =>{
        const character = results.body.map(obj => new Char(obj));
        res.render('pages/index' ,{character:character});
    })
}

function getFav(req,res){
    let sql = 'SELECT * FROM exam ;';
    // let saveval = ['api'];
    client.query(sql).then(data =>{
        res.render('pages/favorite' ,{data:data.rows});
    })
}

function favhandle(req,res){
    let sql = 'INSERT INTO exam(name,house,patronus,is_alive,created_by) VALUES($1, $2, $3, $4, $5);';
   let saveval = [req.body.name,req.body.house,req.body.patronus,req.body.alive,'api'];
   client.query(sql,saveval).then(data =>{
       res.redirect('/addFav');
   }) 
}

function detailspage(req,res){
    let id = req.params.id;
    let sql = 'SELECT * FROM exam WHERE id=$1;';
    client.query(sql,[id]).then(data =>{
        res.render('pages/details' ,{data:data.rows});
    })
}

function deletedetails(req,res){
    let id = req.params.id;
    let sql = 'DELETE FROM exam WHERE id=$1;';
    client.query(sql,[id]).then(data =>{
        res.redirect('/');
    })
}

function updatedetails(req,res){
    let id = req.params.id;
    let sql = 'UPDATE exam SET name=$1, house=$2, patronus=$3, is_alive=$4 WHERE id=$5;';
    let saveval = [req.body.name,req.body.house,req.body.patronus,req.body.alive ,id];
    client.query(sql,saveval).then(results =>{
        console.log(results.rows);
        res.redirect(`/details/${id}`);
    })
}

function createchar(req,res){
    let sql = 'INSERT INTO exam(name,house,patronus,is_alive,created_by) VALUES($1, $2, $3, $4, $5);';
    let saveval = [req.body.name,req.body.house,req.body.patronus,req.body.alive,'user'];
    client.query(sql,saveval).then(data =>{
        res.redirect('/addFav');
    })
}

function getcreate(req,res){
    res.render('pages/create');
}

// function getcreatedata(req,res){
//     let sql = 'SELECT * FROM exam WHERE created_by=$1;';
//     let saveval = ['user'];
//     client.query(sql,saveval).then(data =>{
//         console.log(data.rows);
//         res.redirect('/addFav' ,{data:data.rows[0]})
//     })
// }

client.connect().then(() => {
    app.listen(PORT, () => console.log(`I'm working at port ${PORT}`))
});