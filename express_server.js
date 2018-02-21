/*jshint esversion: 6 */

const express = require("express");
const url = require('url');
// starts express
const app = express();
// default port 8080
const PORT = process.env.PORT || 8080;
// default server
const server = 'localhost:8080';
// sets the view engine
app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Genereate a random 6 char string of Upper/Lower case letters and numbers
function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)); }

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
  response.render("urls_index", { urlDatabase: urlDatabase });
});

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.get("/urls/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = {shortURL, longURL};
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


app.post("/urls", (request, response) => {
  response.render("urls_index", { urlDatabase: urlDatabase });
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
  response.render("urls_show", {longURL : longURL, shortURL : shortURL });
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
