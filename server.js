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
const processState = process.env.STATE || 'RANDOMID@@--123'
const state = Buffer.from(processState).toString('base64')
const redirect_url = "http://localhost:4000/auth/microsoft";
const scope = "user.read";
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
app.use((req, res, next) => {
  const string = `Method: ${req.method},Path: ${req.path}, IP Address: ${req.ip}`;
  console.log(string);
  next();
});

app.get('/auth/login-microsoft', (req, res) => {
  console.log(state)
  const urlRequestAuthor = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_url}&response_mode=query&scope=${scope}&state=${state}`;
  return res.redirect(urlRequestAuthor)
});

app.get('/auth/microsoft', async (req, res) => {
  const code = req.query.code
  console.log("code: ", code)
  const url_getToken = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
  console.log("url_getToken : ", typeof url_getToken)
  const data = {
    client_id: client_id,
    scope,
    code,
    redirect_uri: redirect_url,
    grant_type: "authorization_code",
    client_secret,
    response_mode: "form_post"
  };
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data),
    url: url_getToken,
  };
  try {
    axios(options)
      .then(function (response) {
        console.log("2.Data",response.data);
        const options = {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${response.data.access_token}` },
          url: "https://graph.microsoft.com/v1.0/me",
          };
          try {
            axios(options)
              .then(function (response) {
                console.log("2.Data User ",response.data);
                res.send({"User data ": response.data})
              })
              .catch(function (error) {
                console.log("error");
                res.send("Error get data !!!")
              });
          } catch (error) {
            console.log("POST FORM DATA Eroor");
            return res.status(401).send(error)
        }
      })
      .catch(function (error) {
        console.log("error");
      });
  } catch (error) {
    console.log("POST FORM DATA Eroor");
    return res.status(401).send(error)
  }
})

app.post('/auth/microsoft', async (req, res) => {
  
  console.log("3");
  
  // const options = {
  //   method: 'GET',
  //   headers: { 'Authorization': 'application/x-www-form-urlencoded' },
  //   data: qs.stringify(data),
  //   url: url_getToken,
  //   };
  //   try {
  //     axios(options)
  //       .then(function (response) {
  //         console.log("1.Data",response.data);
  //       })
  //       .catch(function (error) {
  //         console.log("error");
  //       });
  //   } catch (error) {
  //     console.log("POST FORM DATA Eroor");
  //     return res.status(401).send(error)
  // }

});

app.get('/auth/login', (req, res) => {
  let path = __dirname.split('/');
  path.pop();
  path = path.join('/')
  const file = __dirname + '/views/login.html'
  return res.sendFile(file)
});

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
