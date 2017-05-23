'use strict';

var express = require('express'),
    exphbs  = require('express-handlebars'),
    request = require('request');

var app = express();
var hbs = exphbs.create();
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

var http = app.listen(80, function () {
    console.log('kakaoAuth example server listening on: 80');
});

var adminKey = "adminKey";
var javascriptKey = "javascriptKey";
var restApiKey = "restApiKey";

var accessToken, kakaoScope;

app.get('/javascript', (req,res)=>{
    res.render('javascript', {javascriptKey:javascriptKey});
});

app.get('/restApi', (req,res)=>{
    res.render('restApi', {restApiKey:restApiKey});
});

app.get('/kakaoAuth', (req,res)=>{
  var params = {grant_type: "authorization_code",
                client_id: restApiKey,
                redirect_uri: "http://localhost/kakaoAuth",
                code: req.query.code};
  request.post("https://kauth.kakao.com/oauth/token", {form:params}, (err,resp,body)=>{
    if(body) {
      var data = JSON.parse(body);
      accessToken = data.access_token;
      kakaoScope = data.scope;
    }
    res.redirect('/restApi');
  });
});

app.get('/kakaoLogout', (req,res)=>{
  if(accessToken) request.post({url:"https://kapi.kakao.com/v1/user/logout", headers:{Authorization:"Bearer "+accessToken}}, (err,resp,body)=>{ accessToken=null; res.redirect("/restApi"); });
  else res.redirect('/restApi');
});

app.get('/userInfo', (req,res)=>{
  var options = {url:"https://kapi.kakao.com/v1/user/me", headers:{Authorization:"Bearer "+accessToken}};
  if(accessToken) request.post(options, (err,resp,body)=>{ if(body) { var tmpJson = JSON.parse(body); tmpJson["scope"] = kakaoScope; res.json(tmpJson); } else res.json({msg:"response error."}); });
  else res.json({msg:"accessToken does not exist."});
});

app.get('/userInfoUpdate', (req,res)=>{
  var options = {url:"https://kapi.kakao.com/v1/user/update_profile", headers:{Authorization:"Bearer "+accessToken}, form:{properties:JSON.stringify({nickname:req.query.nickname})}};
  if(accessToken) request.post(options, (err,resp,body)=>{ if(body) res.json(JSON.parse(body)); else res.json({msg:"response error. MSG : "+err}); });
  else res.json({msg:"accessToken does not exist."});
});

app.get('/userIdList', (req,res)=>{
  var options = {url:"https://kapi.kakao.com/v1/user/ids", headers:{Authorization:"KakaoAK "+adminKey}};
  request.post(options, (err,resp,body)=>{ if(body) res.json(JSON.parse(body)); else res.json({msg:"response error. MSG : "+err}); });
});

app.get('/tokenInfo', (req,res)=>{
  var options = {url:"https://kapi.kakao.com/v1/user/access_token_info", headers:{Authorization:"Bearer "+accessToken}};
  request.get(options, (err,resp,body)=>{ if(body) { res.json(JSON.parse(body)); } else res.json({msg:"response error. MSG : "+err}); });
});
