# Mobacon Back-end (API)

Mobacon back-end is RESTful API for Web front-end and Mobile Application developed with Node.js, Express Framework.


## Installation
After clone this repository successfully. Install Node.js and install Node.js modules with following command.
	
	npm install yarn -g
	npm install sequelize sequelize-cli -g
	npm install

Create a mysql database named `masa_db` with collection `utf8_unicode_ci` after install Node.js modules successfully. Migrate database with following command.
		
	cd src/
	sequelize db:migrate
	sequelize db:seed:all		

