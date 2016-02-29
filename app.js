var express = require('express');
var app = express() ;
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sessions = require('client-sessions');
var bcrypt = require('bcryptjs');



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
	cookieName : 'sessions',
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
	debugger;
	var hash = bcrypt.hashSync(req.body.password , bcrypt.genSaltSync(10));
	var user = new Users({
		firstName : req.body.firstName,
		lastName : req.body.lastName,
		email : req.body.email,
		password : hash
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
			console.log("=============== creating sessions and redirecting to dashboard============");
			req.sessions.user = user ;
			res.redirect('/dashboard');
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
			if(bcrypt.compareSync(req.body.password , user.password)){
				req.sessions.user = user ;
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
	console.log("=========== in dashboard get request ===========");
	if(req.sessions && req.sessions.user){
		Users.findOne({email : req.sessions.user.email },function(err , user){
			if(!user){
				req.sessions.reset();
				res.redirect('/login');
			}
			else{
				res.locals.user = user ;
				res.render('dashboard.jade');
			}
		});
	}
	else{
	res.redirect('/login');
	}
});

//this is the logout route ....
app.get('/logout',function(req , res){
	req.sessions.reset();
	res.redirect('/');
})

//the server starts listening :
app.listen(3000);

console.log("listening");
