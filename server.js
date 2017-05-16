var express = require('express'),
    app = express(),
    bp       = require('body-parser'),
    session = require('express-session'),
    root     = __dirname,
    path     = require( 'path' ),
    http     = require('http'),
    colors = require('colors'),
    chatServer = require('./chat-server')

var sessionConfig = {
     secret:'CookieMonster', // Secret name for decoding secret and such
     resave:false, // Don't resave session if no changes were made
     saveUninitialized: true, // Don't save session if there was nothing initialized
     name:'myCookie', // Sets a custom cookie name
     cookie: {
       secure: false, // This need to be true, but only on HTTPS
       httpOnly:false, // Forces cookies to only be used over http
       maxAge: 3600000
    }
}
app.set('views', __dirname + '/views');
app.set('view engine', "ejs");
app.engine('ejs', require('ejs').__express);
app.use(bp.urlencoded({extended:true}))
app.use(bp.json({extended: true}));
app.use(session(sessionConfig));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static( path.join(__dirname, '/bower_components')));
// var server = http.createServer(app).listen('8000', '127.0.0.1');
var server = app.listen( 8000, function() {
    console.log('server running on port 8000')
});
chatServer.listen(server);

app.get('/', function(req, res){
	res.render("index");
});
