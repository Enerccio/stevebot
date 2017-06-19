'use strict';

var rs = require("reddit-stream");
var decode = require("unescape");
var textVersion = require("textversionjs");
var strip = require("strip-markdown");
var remark = require("remark");
var processor = remark().use(strip);
var fs = require("fs");

var conf = require("./conf");
var reply = require("./reply.js");

var auth = {
  "username" : conf.reddit.login.username,
  "password" : conf.reddit.login.password,
  "app" : {
    "id" : conf.reddit.apikey,
    "secret": conf.reddit.apisecret
  }
};

var postsStream = new rs("posts", "all", conf.reddit.user_agent, auth);
var commentStream = new rs("comments", "all", conf.reddit.user_agent, auth);

postsStream.start();
commentStream.start();

postsStream.on("new", function(posts) {
  posts.forEach(function(post) {
    operate(post.data.body_html, post.data);
  })
});
postsStream.on("error", function() {});

commentStream.on("new", function(comments) {
  comments.forEach(function(comment) {
    operate(comment.data.body_html, comment.data);
  })
});
commentStream.on("error", function() {});

function pureText(text, cb) {
  text = decode(textVersion(decode(text)));
  processor.process(text, cb);
}

function hasSteveRemark(text) {
  return text.toLowerCase().includes("paid by steve");
}

function rand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var replies = JSON.parse(fs.readFileSync("lines.json"));

function getReply() {
  return replies[rand(0, replies.length)];
}

function operate(body, data) {
  if (body !== undefined) {
    pureText(body, function(err, file) {
      var text = String(file);
      if (hasSteveRemark(text) && conf.reddit.login.username !== data.author) {
        console.log("passed: <<<" + text + ">>>");
        var msg = getReply();
        reply.reply(data.id, msg);
      }
    });
  }
}
