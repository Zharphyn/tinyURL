/*jshint esversion: 6 */

const express = require("express");
const url = require('url');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const _ = require("underscore");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_KEY || 'dvelopment'],
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// default port 8080
const PORT = process.env.PORT || 8080;
// default server
const server = 'localhost:8080';

// sets the view engine
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const saltRounds = 10;
// define emply user object
const emptyUser = {
	id: '',
	email: '',
	password: ''
};


// need to replace this variable with a call to the cookie
let userID = '';

function findUserID(email){
  for (let user in users) {
  	if (users[user].email === email) {
  		return user;
  	}
  }
  return '';
}


// checks if email is empty or already exists
function checkEmailAndPassword(email,password) {
  if (email !== '' && password !== '') {
    for (const keys in users) {
  	  if (email === users[keys].email) {
  	  	console.log('Already exists');
  	    return false;
  	  }
    }
  } else {
  	console.log('Is empty');
    return false;
  }
  return true;
}


// Genereate a random 6 char string of Upper/Lower case letters and numbers
function generateRandomString() {
  let text = "";
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const possible = alphabet + alphabet.toUpperCase() + '1234567890';

  for (var i = 0; i < 6; i++) {
  	text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

app.get("/", (request, response) => {
  response.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/urls", (request, response) => {
  let templateVars = {urlDatabase: urlDatabase};
  if (userID) {
  	templateVars.user = users[userID];
  } else {
  	templateVars.user = emptyUser;
  }

  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = {urlDatabase: urlDatabase};
  console.log(userID);
  if (userID) {
  	templateVars.user = users[userID];
  } else {
  	templateVars.user = emptyUser;
  }
  response.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = {shortURL, longURL};
  if (userID) {
  	templateVars.user = users[userID];
  } else {
  	templateVars.user = emptyUser;
  }
  response.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  let longURL = urlDatabase[shortURL];
  if (longURL !== undefined) {
    response.status(302);
    response.redirect(longURL);
  } else {
    response.status(404);
    response.redirect('https://http.cat/404');
  }
});

app.get("/login", (request, response) => {
  let templateVars = {};
  if (userID) {
  	templateVars.user = users[userID];
  } else {
  	templateVars.user = emptyUser;
  }	response.render("login", templateVars);


});

app.get("/register", (request, response) => {
  let templateVars = {};
  if (userID) {
  	templateVars.user = users[userID];
  } else {
  	templateVars.user = emptyUser;
  }
	response.render('register', templateVars);
});

app.post("/register", (request, response) => {
  const email = request.body.email;

  if (checkEmailAndPassword(email,request.body.password)) { 
    const password = bcrypt.hashSync(request.body.password, saltRounds);
    userID = generateRandomString();
    users[userID] = { id: userID, email: email, password: password };
    response.cookie('email', users[userID].email); 
    response.redirect("/urls");
  } else {
    response.status(400);
    response.redirect('https://http.cat/400');
  }

});

// Logs in the user
app.post("/login", (request, response) => {
  console.log(request.body);
  const email = request.body.email;
  const password = request.body.password;
  if (email !== '' && password !== '')  {
    userID = findUserID(email);
    console.log(userID);
  	if (userID !== '' && bcrypt.compareSync(password, users[userID].password))  {
      response.cookie('email', users[userID].email); 
      response.redirect("/urls");
  	} else {
  	  console.log('UserID / Password verification failure');
      response.status(400);
      response.redirect('https://http.cat/400');
    }
  } else {
  	console.log('Failed basic email / password existance checker');
  	response.cookie('email', 'Unknown');
  	response.status(400);
    response.redirect('https://http.cat/400');
  }
  response.redirect('back');
});

app.post("/logout", (request, response) => {
  userID = '';
  response.clearCookie('email');
  response.redirect('back');

});

app.post("/urls", (request, response) => {
  let templateVars = {urlDatabase: urlDatabase};
  if (userID) {
  	templateVars.user = users[userID];
  } else {
  	templateVars.user = emptyUser;
  }
  response.render("urls_index", templateVars);
});

// Convert shortURL to longURL and go to longURL site
app.post("/urls/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  let longURL = urlDatabase[shortURL];
  if (longURL !== undefined) {
    response.status(302);
    response.redirect(longURL);
  } else {
    response.status(404);
    response.redirect('https://http.cat/404');
  }
});

// Edit the link for a shortURL
app.post("/urls/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = {longURL : longURL, shortURL : shortURL};
  if (userID) {
  	templateVars.user = users[userID];
  } else {
  	templateVars.user = emptyUser;
  }
  response.render("urls_show", templateVars );
});

// Update the longURL using same shortURL
app.post("/urls/show/:shortURL", (request, response) => {
	urlDatabase[request.params.shortURL] = request.body.name;
	response.redirect(`${server}/urls_index`);
});

// Deletes a shortURL / longURL pair from the database
app.post("/urls/:shortURL/delete", (request, response) => {
  delete urlDatabase[request.params.shortURL];
  response.redirect('back');
});

// adds a new shortURL / longURL pair to the database
app.post("/urls/new", (request, response) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;
  response.redirect(`http://localhost:8080/urls/${shortURL}`);
});

//H Hello World
app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});
