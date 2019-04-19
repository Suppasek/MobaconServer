# Mobacon Back-end (API)

Mobacon back-end is RESTful API for Web front-end and Mobile Application developed with Node.js, Express Framework.

## Installation
After clone this repository successfully. Install Node.js and install Node.js modules with following command,
	
	$ cd mobacon-server/
	$ npm install sequelize sequelize-cli -g
	$ npm install

or use yarn instead.

	$ cd mobacon-server/
	$ npm install yarn -g
	$ yarn global add sequelize sequelize-cli
	$ yarn install

After install Node.js modules successfully, create a mysql database with collection `utf8_general_ci` (recommended).

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
	
Or use the following command for reset data in database (undo seed -> undo migrate -> new migrate -> new seed).
	
	$ npm run reset-db	

or

	$ yarn reset-db
