/*jshint esversion: 6 */

var express = require("express");
var app = express(); // starts express
var PORT = process.env.PORT || 8080; // default port 8080
app.set('view engine', 'ejs'); // sets the view engine

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});
