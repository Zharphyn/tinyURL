/*jshint esversion: 6 */

const express = require("express");
const url = require('url');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_KEY || 'toronitz']
}));
app.use(bodyParser.urlencoded({ extended: true }));

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

function findUserID(email) {
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

//app.get routes
app.get("/", (request, response) => {
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

// displays the user's urls
app.get("/urls", (request, response) => {
  if (request.session.loggedIn) {
    let templateVars = { urlDatabase: urlDatabase[request.session.userID] };
    templateVars.user = users[request.session.userID];
    response.render("urls_index", templateVars);
  } else {
    response.redirect('/login');
  }
});

app.get("/urls_index", (request, response) => {
  response.redirect('/');
});

app.get("/urls/new", (request, response) => {
  if (request.session.loggedIn) {
    let templateVars = { urlDatabase: urlDatabase[request.session.userID] };
    templateVars.user = users[request.session.userID];
    templateVars.longURL = '';
    response.render("urls_new", templateVars);
  } else {
    response.redirect('/login');
  }
});

// displays the shortURL and longURL for editing
app.get("/urls/:shortURL", (request, response) => {
  if (request.session.loggedIn) {
    let shortURL = request.params.shortURL;
    let longURL = urlDatabase[request.session.userID][shortURL];
    let templateVars = { shortURL, longURL };
    templateVars.user = users[request.session.userID];
    response.render("urls_show", templateVars);
  } else {
    response.redirect('/login');
  }
});

// takes the user to the longURL based upon the shortURL
app.get("/urls/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  let longURL = '';
  if (request.session.loggedIn) {
    longURL = urlDatabase[request.session.userID][shortURL];
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
  if (request.session.loggedIn) {
    templateVars.user = users[request.session.userID];
  } else {
    templateVars.user = emptyUser;
  }
  response.render("login", templateVars);
});

// opens the register page
app.get("/register", (request, response) => {
  let templateVars = {};
  if (request.session.loggedIn) {
    templateVars.user = users[request.session.userID];
  } else {
    templateVars.user = emptyUser;
  }
  response.render('register', templateVars);
});

// app.post routes
// creates a new registration
app.post("/register", (request, response) => {
  const email = request.body.email;

  if (checkEmailAndPassword(email, request.body.password)) {
    const password = bcrypt.hashSync(request.body.password, saltRounds);
    const userID = generateRandomString();
    users[userID] = { id: userID, email: email, password: password };
    request.session.userID = userID;
    request.session.email = users[userID].email;
    request.session.loggedIn = true;
    response.redirect("/");
  } else {
    response.status(400);
    response.redirect('https://http.cat/400');
  }
});

// Logs in the user
app.post("/login", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  if (email !== '' && password !== '') {
    const userID = findUserID(email);
    if (userID !== '' && bcrypt.compareSync(password, users[userID].password)) {
      request.session.email = users[userID].email;
      request.session.userID = userID;
      request.session.loggedIn = true;
      response.redirect("/");
    } else {
      response.status(400);
      response.redirect('https://http.cat/400');
    }
  } else {
    resquest.session.email('Unknown');
    response.status(400);
    response.redirect('https://http.cat/400');
  }
  response.redirect('/');
});

// logs out the current user
app.post("/logout", (request, response) => {
  request.session.userID = '';
  request.session.loggedIn = false;
  request.session.email = '';
  response.redirect('/');

});

app.post("/urls", (request, response) => {
  let templateVars = { urlDatabase: urlDatabase[request.session.userID] };
  if (request.session.loggedIn) {
    templateVars.user = users[request.session.userID];
    response.render("urls_index", templateVars);
  } else {
    templateVars.user = emptyUser;
    response.redirect('/');
  }
});

// Convert shortURL to longURL and go to longURL site
app.post("/urls/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  response.redirect(`/urls/u/${shortURL}`);
});

// Edit the link for a shortURL
app.post("/urls/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  if (request.session.loggedIn) {
    response.redirect(`/urls/${shortURL}`);
  } else {
    response.redirect('/');
  }
});

// Update the longURL using same shortURL
app.post("/urls/show/:shortURL", (request, response) => {
  if (request.session.loggedIn) {
    urlDatabase[request.session.userID][request.params.shortURL] = request.body.name;
  }
  response.redirect('/');
  
});

// Deletes a shortURL / longURL pair from the database
app.post("/urls/:shortURL/delete", (request, response) => {
  if ((request.session.loggedIn) && (request.session.email === users[request.session.userID].email)) {
    delete urlDatabase[request.session.userID][request.params.shortURL];
  }
  response.redirect('/');
});

// adds a new shortURL / longURL pair to the database
app.post("/create", (request, response) => {
  let shortURL = generateRandomString();
  console.log(shortURL, request.body.longURL);
  if (request.session.loggedIn){
    console.log('I am logged in!!');
    console.log(`userID = ${request.session.userID} | urlDatabase = ${urlDatabase[request.session.userID]}`);
    urlDatabase[request.session.userID][shortURL] = request.body.longURL;
    console.log(urlDatabase[request.session.userID][shortURL], request.body.longURL);
  } else {
    console.log('I am not loggedIn');
  }
  console.log('Redirecting');
  response.redirect('/');
});

//H Hello World
app.get("/hello", (request, response) => {
  response.redirect(`/urls/`);
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});