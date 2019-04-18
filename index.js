const fs = require('fs')
const execSync = require('child_process').execSync

/*
** UPDATE PACKAGE.JSON
*/

// If package.json exists, import it
const packageFile = './package.json'
let packageJson

try {
  if (fs.existsSync(packageFile)) {
    packageJson = require(packageFile)
  } else {
    console.error(`${packageFile} not found, are you sure this is an Angular project?`)
    process.exit(1)
  }
} catch (error) {
  console.error(error)
  process.exit(1)
}

// Get current node version but strip the "v" prefix
const nodeVersion = process.version.replace(/v/, "")

// Get current npm version but strip the trailing newline, "\n"
const npmVersion = execSync('npm -v').toString().replace(/\n/g,"")

// Create engines key with node and npm versions of current system
packageJson["engines"] = {
  "node": nodeVersion,
  "npm": npmVersion
}

// Update the start script
packageJson.scripts["start"] = "node server.js"

// Create Heroku postbuild script
packageJson.scripts["heroku-postbuild"] = "ng build --prod"

// List of devDependencies to move to dependencies
const devDependenciesToMove = [
  "@angular/cli",
  "@angular/compiler-cli",
  "typescript"
]

// Loop through the list and move each item
// Delete the item from devDependencies afterward
for (let dependency of devDependenciesToMove) {
  // Check if the dependency exists in devDependencies
  if (dependency in packageJson.devDependencies) {
    let dependencyVersion = packageJson.devDependencies[dependency]
    packageJson.dependencies[dependency] = dependencyVersion
    delete packageJson.devDependencies[dependency]  
  } else {
    console.error(`${dependency} was not found in devDependencies, are you sure this is an Angular project?`)
    process.exit(1)
  }
}

// Helper function to sort object keys alphabetically
function sortObjectKeys(object) {
  let ordered = {}
  Object.keys(object).sort().forEach((key) => {
    ordered[key] = object[key]
  })
  return ordered
}

// Sort dependencies so they appear alphabetically in package.json
packageJson.dependencies = sortObjectKeys(packageJson.dependencies)


/*
** PROCFILE CONFIG
*/
const procfileFile = "./Procfile"

// Procfile contents
const procCommand = "web: npm start"


/*
** CREATE SERVER.JS
*/



/*
** WRITE ALL THE FILES
*/

// Write package.json
fs.writeFile(packageFile, JSON.stringify(packageJson, null, 2), (error) => {
  if (error) return console.log(error)
  console.log(`${packageFile} updated!`)
})

// Create Procfile
fs.writeFile(procfileFile, procCommand, (error) => {
  if (error) return console.error(error)
  console.log(`${procfileFile} created!`)
})
