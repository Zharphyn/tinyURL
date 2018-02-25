/*jshint esversion: 6 */

const express = require("express");
//const url = require('url');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const _ = require("underscore");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_KEY || 'toronitz']
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
  "zds001": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.1pmscouts.rocks",
    "cat001": "https:http.cat"
  }
};

const users = {
  "zds001": {
    id: "zds001",
    email: "brad@zharphyn.ca",
    password: "$2a$10$e5A1yqhI2ARxP0..SmUM.eGpNk1UbxTb0BirIdzG5NxlZBmz.Uppe"
  },
  "Xgt6I0": {
    id: "Xgt6I0",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// saltRounds is used during password Hashing
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
function checkEmailAndPassword(email, password) {
  if (email !== '' && password !== '') {
    for (const keys in users) {
      if (email === users[keys].email) {
        return false;
      }
    }
  } else {
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

// displays the user's urls
app.get("/urls", (request, response) => {
  let templateVars = {urlDatabase: urlDatabase[userID]};
  if (userID) {
    templateVars.user = users[userID];
    response.render("urls_index", templateVars);
  } else {
    response.redirect('/login');
  }
});

app.get("/urls/new", (request, response) => {
  if (userID !== ''){
    let templateVars = {urlDatabase: urlDatabase[userID]};
    templateVars.user = users[userID];
    response.render("urls_new", templateVars);
  } else {
    response.redirect('/login');
  }
});

// displays the shortURL and longURL for editing
app.get("/urls/:shortURL", (request, response) => {
  if (userID) {
    let shortURL = request.params.shortURL;
    let longURL = urlDatabase[userID][shortURL];
    let templateVars = {shortURL, longURL};
    templateVars.user = users[userID];
    response.render("urls_show", templateVars);
  } else {
    response.redirect('/login');
  }
});

// takes the user to the longURL based upon the shortURL
app.get("/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  let longURL = '';
  if (userID) {
    longURL = urlDatabase[userID][shortURL];
  } else {
    for (let key in urlDatabase) {
      if (urlDatabase[key][shortURL] !== undefined) {
        longURL = urlDatabase[key][shortURL];
      }
    }
  }
  if (longURL !== undefined && longURL !== '') {
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

// opens the register page
app.get("/register", (request, response) => {
  let templateVars = {};
  if (userID) {
    templateVars.user = users[userID];
  } else {
    templateVars.user = emptyUser;
  }
  response.render('register', templateVars);
});

// creates a new registration
app.post("/register", (request, response) => {
  const email = request.body.email;

  if (checkEmailAndPassword(email, request.body.password)) {
    const password = bcrypt.hashSync(request.body.password, saltRounds);
    userID = generateRandomString();
    users[userID] = { id: userID, email: email, password: password };
    request.session.email =  users[userID].email;
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
    if (userID !== '' && bcrypt.compareSync(password, users[userID].password))  {
      request.session.email = users[userID].email;
      response.redirect("/urls");
    } else {
      response.status(400);
      response.redirect('https://http.cat/400');
    }
  } else {
    resquest.session.email('Unknown');
    response.status(400);
    response.redirect('https://http.cat/400');
  }
  response.redirect('back');
});

// logs out the current user
app.post("/logout", (request, response) => {
  userID = '';
  request.session = null;
  response.redirect('back');

});

app.post("/urls", (request, response) => {
  let templateVars = {urlDatabase: urlDatabase[userID]};
  if (userID) {
    templateVars.user = users[userID];
    response.render("urls_index", templateVars);
  } else {
    templateVars.user = emptyUser;
    response.redirect('/login');
  }
});

// Convert shortURL to longURL and go to longURL site
app.post("/urls/u/:shortURL", (request, response) => {
  if (longURL !== undefined) {
    let shortURL = request.params.shortURL;
    let longURL = urlDatabase[userID][shortURL];
    response.status(302);
    response.redirect(longURL);
  } else {
    response.status(404);
    response.redirect('https://http.cat/404');
  }
});

// Edit the link for a shortURL
app.post("/urls/:shortURL", (request, response) => {
  if (userID) {
    let shortURL = request.params.shortURL;
    let longURL = urlDatabase[userID][shortURL];
    let templateVars = {longURL: longURL, shortURL: shortURL};
    templateVars.user = users[userID];
    response.render("urls_show", templateVars );
  } else {
    response.redirect('/login');
  }
});

// Update the longURL using same shortURL
app.post("/urls/show/:shortURL", (request, response) => {
  if (userID) {
    urlDatabase[userID][request.params.shortURL] = request.body.name;
    response.redirect(`${server}/urls_index`);
  } else {
    response.redirect('/login');
  }
});

// Deletes a shortURL / longURL pair from the database
app.post("/urls/:shortURL/delete", (request, response) => {
  if (userID === urlDatabase[userID]){
    delete urlDatabase[request.params.shortURL];
    response.redirect('back');
  } else {
    response.redirect('/login');
  }
});

// adds a new shortURL / longURL pair to the database
app.post("/urls/new", (request, response) => {
  let shortURL = generateRandomString();
  urlDatabase[userID][shortURL] = request.body.longURL;
  response.redirect(`http://localhost:8080/urls/${shortURL}`);
});

//H Hello World
app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});
