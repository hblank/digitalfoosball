## Part two: Mobile Webapp ##

### Which software needs to be installed on the server side ###
* `NodeJS 0.4.8`
* `NPM 1.0.6`
* NPM Modules: `socket.io 0.6.x`, `express 2.3.x`, `oauth 0.9.x` and `mustache 0.3.x`


### Configuration ###
Copy `config.sample.json` to `config.json`.

Enter the values of your setup. Check the resources folder for available locales.

* `locale`: the language of frontend. Check the resources folder for available locales.
* `cdn`: if you deploy the static files to different host on your production server, enter the server name. If you need a cache-folder in the path to your CDN, change `rev.json` to the current folder.
* `ga`: if you want to track your app with Google Analytics, enter your key here.
* `server`: the port where NodeJS can bind the HTTP server on. You can also configure the port for your websockets.
* `socketconf`: the host and port to which the client connects. if the websocket url is different then the webapp url enter it here.
* `couchdb`: the host and port of your CouchDB server and also the name of your database.
* `scoreboard`: enter the names of table figures. Set inverted to true, if "Visitors" should be displayed first on the scoreboard.
* `twitter`: the credentials of the twitter app which allows sending tweets. (See "Twitter" below).


### Server startup ###
Start the server with the `startup.bash` script in the `lib` folder.

On the production server use the line with `NODE_ENV=production` to get the app in production mode (which is faster).


### Build Process ###
We recommend you to setup up a build process in your deployment tool to create the minified versions of the Stylesheet and JavaScript by yourself.
We're recommend [less.js](https://github.com/cloudhead/less.js) and [uglify-js](https://github.com/mishoo/UglifyJS/) for this task.


### Twitter ###
The server tweets the game result to Twitter. If you don't want to use this, remove the twitter entry. Otherwise go to [twitter.com](http://twitter.com) create an account for your table and then register a new [twitter app](http://dev.twitter.com/) and enter the given credentials you'll see at the app. Only this allows the app to tweet.

