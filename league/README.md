## Part three: League CouchApp ##

### Which software needs to be installed on the server side ###

* `NodeJS 0.4.8`
* `CouchDB 1.0.2`


### Configuration ###
Copy `config.sample.json` to `config.json`.

Enter the values of your setup. Check the resources folder for available locales.

* `env`: this should be "development" or "production". It determines if the app will use minified css and js or not.
* `locale`: the language of frontend. Check the resources folder for available locales.
* `cdn`: if you deply the static files to different host on your production server, enter the server name.
* `rev`: if you need a cache-folder in the path to your CDN, change this value to the current folder.
* `ga`: if you want to track your app with Google Analytics, enter your key here.
* `socketconf`: the host and port of the webserver on which the mobileapp runs.
* `couchdb`: the host and port of your CouchDB server and also the name of your database.
* `scoreboard`: enter the names of table figures. Set inverted to true, if "Visitors" should be displayed first on the scoreboard.


### Deployment ###
We recomment you to deploy the CouchApp with [soca](https://github.com/quirkey/soca). The `config.js` within the directory determines the structure of the design-document. You have to configure the path to your database to which soca should deploy. For this create a file named `.couchapprc` in the `league` folder with the following content:

    {
      "env": {
        "default": {
          "db": "<host>:<port>/<database>"
        }
      }
    }

You also have to create a document with the id `config` in your database. The content of this document should be the same as your `config.json`.

### Startup ###
First start your CouchDB server. Now you can start the `calc.js` script in the `lib` folder with NodeJS. This will recalculate your league after each game with named players.


### Build Process ###
We recommend you to setup up a build process in your deployment tool to create the minified versions of the Stylesheet and JavaScript by yourself.
We're recommend [less.js](https://github.com/cloudhead/less.js) and [uglify-js](https://github.com/mishoo/UglifyJS/) for this task.

