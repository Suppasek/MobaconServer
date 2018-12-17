# Mobacon Back-end (API)

Mobacon back-end is RESTful API for Web front-end and Mobile Application developed with Node.js, Express Framework.

## Installation
After clone this repository successfully. Install Node.js and install Node.js modules with following command.
	
	$ cd mobacon-server/
	$ npm install yarn -g
	$ npm install sequelize sequelize-cli -g
	$ npm install

After install Node.js modules successfully, create a mysql database with collection `utf8_unicode_ci`.

Configure database connection at `src/config/config.json`

```javascript
"development": {
	"username": "[username]",
	"password": "[password]",
	"database": "[database_name]",
	"host": "127.0.0.1",
	"dialect": "mysql"
}
```

Migrate and seed data to database with following command.
 
	$ cd src/
	$ sequelize db:migrate
	$ sequelize db:seed:all

## License
Buzzfreeze Solution
