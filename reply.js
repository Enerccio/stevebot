'use strict';

var snoo = require("snoowrap");

var conf = require("./conf");

var reddit = new snoo({
    userAgent: conf.reddit.user_agent,
    clientId: conf.reddit.apikey,
    clientSecret: conf.reddit.apisecret,
    username: conf.reddit.login.username,
    password: conf.reddit.login.password
});

function reply(postId, text) {
  text += "\n\n^(Source: https://github.com/Enerccio/stevebot)";
  reddit.getComment(postId).reply(text).catch(function (err) {
            console.log(err);
  });
}

module.exports = { reply : reply };
