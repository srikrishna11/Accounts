var express = require('express');
var app = express() ;
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sessions = require('client-sessions');



var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId ;

var Users = mongoose.model('Users',new Schema({
	id : ObjectId , 
	firstName : String , 
	lastName : String ,
	email : {type : String , unique:true},
	password : String,
}))

app.set('view engine' , 'jade');
app.locals.pretty = true ;


//connects to the mongodb server 
mongoose.connect('mongodb://localhost/auth');


//middleware : before we run any of our requests it is going to run the request through this function , makes the request to be 
//available through req.body
app.use(bodyParser.urlencoded({extended : true }));

//sessions code :
app.use(sessions({
	cookie : 'session',
	secret : 'adsjf;lajoiweruosajdflkajflweiojosnadfoaweoirjasokdjflkajds',
	duration : 30 * 60 * 1000 ,
	activeDuration : 60 * 1000 ,
}));


//home pgae of the website :
app.get('/' , function(req , res ) {
	res.render('index.jade');
});


//to validate the details and store in the database :
app.post('/register',function(req,res){
	var user = new Users({
		firstName : req.body.firstName,
		lastName : req.body.lastName,
		email : req.body.email,
		password : req.body.password
	});
	user.save(function(err){

		if(err){
			var error = 'something went wrong';
			if(err.code === 11000){
				error = 'that mail is already taken.....';
			}
			res.render('register.jade',{error : error});
		}
		else{
			res.render('dashboard.jade');
		}
	});
	//res.render(register);
});


//to get the registration page :
app.get('/register',function(req,res){
	res.render("register.jade");
});


//to get the login page :
app.get('/login',function(req , res){
	res.render('login.jade');
});


//to validate the login credentials :
app.post('/login',function(req , res){
	Users.findOne({email : req.body.email}, function(err , user){
		if(!user){
			res.render('login.jade', { error : 'Invalid email or password ....'});
		}else {
			if(req.body.password === user.password){
				res.redirect('/dashboard');
			}
			else{
				res.render('login.jade', {error : 'Invalid email or password ....'});
			}
		}
	})
});


//this is the dashboard page :
app.get('/dashboard',function(req,res){
	res.render('dashboard.jade');
})


//the server starts listening :
app.listen(3000);

console.log("listening");
