# Digital Foosball #

This is german engineering, so please read all instructions carefully. :-)


## Idea & Philosophy ##
Bringing the analog foosball table into the digital age. 
Because the web is our DNA, we're using Web Technologies to get it online. We also want to make usage of the latest and greatest HTML5/CSS3 technologies to show what's possible today. The idea is from the future, so the software is same.


## Which modules are included ##

### Arduino ###
Hardware mounted to the foosball table, including light barriers und an Arduino board with Wifi shield.
See our [Wiki](https://github.com/sinnerschrader/digitalfoosball/wiki/Installation-Instructions:-Part-one:-Hardware) where we explain the first part, how to turn an analog foosball table into a digital one, sending HTTP POSTs on every goal.

### HTML5 Mobile Webapp with app server ###
The mobile Webapp to start and stop the games and follow the score. It also includes the web server which sends the game events to the CouchDB and Twitter.
Look at the included readme file and our [Wiki](https://github.com/sinnerschrader/digitalfoosball/wiki/Installation-Instructions:-Part-two:-Mobile-web-app) for installation help.

### HTML5 CouchApp (League) ###
The website which displays the game feeds, league and statistics.
Release coming soon...


## Q&A ##

### Which platform do you support? ###
With keeping the philosophy in mind, we have chosen Webkit-based Browsers as developing target. It has the widest support of HTML5 and CSS3 standards and is available on many platforms (Chrome, Safari and Android, iOS) and it's super fast. 

### What about other current browsers? ###
If we have used un-released HTML5/CSS3 features we've added them using all known vendor extensions. So if other engines implements these feature too, it will work like a charm. We won't add further support to keep the code as sleek and fast as possible.

### Will you add support for older browsers? ###
To stay in line with the philosophy: nope.

### Which Browser do you recommend? ###
The developers are Apple Fanboys, so we recommend newest Safari and iPhone. :-)

### I'd like to connect it to Skynet ###
That's fine for us.

### Is there more help ###
Checkout the [Wiki](https://github.com/sinnerschrader/digitalfoosball/wiki)

---
You've read all instructions? Well done.  
Viel Spaß mit dem Projekt.

---
See `LICENSE`