==================================================
WHAM: SocialCompass
CS5500 – Team 3 – Team Domination
==================================================

Development Tools

==================================================

	JetStorm WebStorm, Visual Studio or SublimeText.
	Git
	Openshift RHC tools.
	MongoChef. 

==================================================

Operating Instructions

==================================================
1) Installing Node
	a) Go to https://nodejs.org/en/ and download v4.2.3 MSI file and install it on your Windows pc. For installing on mac or Linux check https://nodejs.org/en/ for installation instructions.
2) GIT
	a) Install git on you system and clone the repository from https://github.ccs.neu.edu , by using the Git Clone command.
	b) Navigate to the cloned repository on the command line. Execute the command npm install, this would read the package.json in the repository and install all the dependencies.
	c) All the dependencies for an AngularJS application and other API references are included in the HTML files by using their CDN links.
3) MongoDB.
	a) Go to https://www.mongodb.org/ and download MongoDB 3.2 and install it on your system.
4) Executing the Node application.
	a) The MongoDB server should be started before you start the application. Navigate to the bin folder of the installation directory and execute the command mongod to start the MongoDB server.
	b) After installing all the dependencies start the node application using the command node server.js.
	c) Open a new window on any browser of your choice and use the URL 	http://localhost:8080/ to open the application on the local mode.
5) Openshift Synchronization
	a) We use RedHat Openshift platform to host our application. The link to the application is http://wham-teamdomination.rhcloud.com/#/ .
	b) Install RHC tools on your system. Visit the website https://developers.openshift.com/en/getting-started-windows.html#client-tools for instructions on installation. Then register the application using the command rhc setup and setup you application on openshift and clone the openshift repository.
	c) Every time a change is made in the Code Base use the following series of commands to push the commits and restart the application on openshift.
		i) git add .
		ii) git commit –am “ commit message ”
		iii) git push

==================================================

API Dependencies

==================================================

We are using the following APIs in our application

Eventful API:
	Eventful is the world's largest collection of events, taking place in local markets throughout the world, from concerts and sports to singles events and political rallies. Eventful provides an API which helps developers leverage their data.
	We use Eventful API to get data in the following ways:
		Data of all events based on:
			user’s location
			user’s location and preference
			keywords (words contained in the event name) or categories
		Details about an event:
			using the event’s ID

Google API:
	Google Map API - Display event locations and user’s locations
	Generate auto-suggestion by location - To suggest city names in the user’s profile page and on dashboard search

ShareThis:
	This is a temporary solution to share events on social networks. Normal facebook/google+ sharer sends a robot to read the meta-data from the actual link. Since we are using dynamic content on our pages, the sharer is not able to read data correctly. The fix to this is a longer process of redirecting the facebook robot to a temporary server side page with the required information. In the future this API should be replaced with a better version.
