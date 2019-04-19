# Hangular

Configure new Angular projects for Heroku deployments.

## Install
```
npm install --save-dev hangular
```
or
```
npm install -g hangular
```

## Usage
### Locally
```
ng new my-cool-app
cd my-cool-app
npm install --save-dev hangular
hangular
```

### Globally
```
ng new my-cool-app
cd my-cool-app
hangular
```

### Usage on Existing Projects
Hangular is designed to be used with newly-created Angular apps.  

While it may work on existing projects, we suggest using the section below to make the necessary modifications manually to prevent any complications.  Don't worry, though, it's really easy!

## What Does Hangular Modify?

### Update package.json
Hangular updates package.json in three ways.

#### Move devDependencies to dependencies
The following devDependncies are all moved:
```javascript
"@angular/cli": "..."
"@nagular/compiler-cli": "..."
"@angular/typescript": "..."
```

#### Add/Update Scripts
The start script is updated.
```javascript
"start": "node server.js"
```

A new ```"heroku-postbuild"``` script is added.
```javascript
"heroku-postbuild": "ng build --prod"
```

#### Add Engines
We tell Heroku what version of node and npm to use by adding an ```"engines"``` field.  Hangular grabs the version numbers from your current operating system.
```javascript
"engines": {
  "node": "...",
  "npm": "..."
}
```

### Install Express and Create server.js
In order to serve the Angular application on Heroku, we need a fast, lightweight web-server.  Server.js sets up a minimal Express server sending all requests to index.html, the entry point of our Angular application.
```
npm install express
```
and
```javascript
const express = require('express');
const path = require('path');

const app = express();

const appName = require('./package.json').name

app.use(express.static(__dirname + '/dist/' + appName));

app.get('/*', function(req,res) {    
  res.sendFile(path.join(__dirname + '/dist/' + appName + '/index.html'));
});

app.listen(process.env.PORT || 8080);
```

### Create Procfile
We tell Heroku what type of app we're serving and how to start it through the Procfile.
```
web: npm start
```
