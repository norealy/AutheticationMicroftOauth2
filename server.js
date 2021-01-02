require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser')
const qs = require('qs');
const axios = require('axios');
const app = express();
let port = process.env.PORT || 8001;
app.use("/", express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./public'))
/* Microsoft azure */
const processState = process.env.STATE || 'RANDOMID@@--123'
const state = Buffer.from(processState).toString('base64')
const redirect_url = "http://localhost:4000/auth/microsoft";
const scope = "user.read";
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
/* Google Api console */
const access_type_gg = "online"
const client_id_gg = process.env.CLIENT_ID_GG;
const response_type_gg = "code"
const redirect_uri_gg = "http://localhost:4000/auth/google";
const scope_gg = "openid profile email";
const state_gg = Buffer.from(processState).toString('base64')
const client_secret_gg = process.env.CLIENT_SECRET_GG;

app.get('/auth/login', (req, res) => {
  let path = __dirname.split('/');
  path.pop();
  path = path.join('/')
  const file = __dirname + '/views/login.html'
  return res.sendFile(file)
});

app.get('/auth/login-google', (req, res) => {
  console.log(state)
  const urlRequestAuthor = `https://accounts.google.com/signin/oauth?access_type=${access_type_gg}&scope=${scope_gg}&response_type=${response_type_gg}&client_id=${client_id_gg}&redirect_uri=${redirect_uri_gg}`;
  return res.redirect(urlRequestAuthor)
});

app.get('/auth/google', (req, res) => {
  const code = req.query.code
  console.log("code google: ", code)
  const url_getToken = "https://oauth2.googleapis.com/token";
  const data = {
    client_id: client_id_gg,
    code:code,
    redirect_uri: redirect_uri_gg,
    grant_type: "authorization_code",
    client_secret:client_secret_gg,
    // state:state_gg
  };

  console.log("DATA:",data)
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: data,
    url: url_getToken,
  };
  try {
    console.log("Before : POst")
    axios(options)
      .then(function (response) {
        console.log("2.Data",response.data);
        const options = {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${response.data.access_token}` }, //id_token
          url: "https://www.googleapis.com/oauth2/v3/userinfo",
          };
          try {
            axios(options)
              .then(function (resp) {
                console.log("2.Data User ",resp.data);
                return res.send(resp.data)
              })
              .catch((error)=>{
                return res.send(error);
              });
          } catch (error) {
            console.log("POST FORM DATA Eroor");
            return res.status(401).send(error)
        }
      })
      .catch(function (error) {
          console.log("After : POst")
        console.log(error);
      });
  } catch (error) {
    console.log("POST FORM DATA Eroor");
    return res.status(401).send(error)
  }
});

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
