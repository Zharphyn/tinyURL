/*jshint esversion: 6 */

const express = require("express");
const url = require('url');
const app = express(); // starts express
const PORT = process.env.PORT || 8080; // default port 8080
app.set('view engine', 'ejs'); // sets the view engine

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

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

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
  console.log(request.body);  // debug statement to see POST parameters
  response.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});
