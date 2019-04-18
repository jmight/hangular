#!/usr/bin/env node

const fs = require('fs')
const execSync = require('child_process').execSync

const currentDir = process.cwd()
const sourceDir = `${__dirname}/src`

/*
** UPDATE PACKAGE.JSON
*/

// If package.json exists, import it
const packageFile = `${currentDir}/package.json`
let packageJson

try {
  if (fs.existsSync(packageFile)) {
    packageJson = require(packageFile)
  } else {
    console.error(`${packageFile} not found, are you sure this is an Angular project?`)
    process.exit(1)
  }
} catch (err) {
  throw err
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

// Check if devDependencies key exists in package.json
if (!("devDependencies" in packageJson)) {
  console.error('devDependencies was not found in package.json, are you sure this is an Angular project?')
  process.exit(1)
}

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

// Sort dependencies so they appear alphabetically in package.json
packageJson.dependencies = sortObjectKeys(packageJson.dependencies)


/*
** COPY SOURCE FILES AND WRITE PACKAGE.JSON
*/
copyFromSrc('Procfile')
copyFromSrc('server.js')

fs.writeFile(packageFile, JSON.stringify(packageJson, null, 2), (err) => {
  if (err) throw err
  console.log(`Updated package.json`)
})


/*
** HELPER FUNCTIONS
*/

// Sort an object's keys alphabetically
function sortObjectKeys(object) {
  let ordered = {}
  Object.keys(object).sort().forEach((key) => {
    ordered[key] = object[key]
  })
  return ordered
}

// Copies a file from source directory to current directory
// TODO: Allow for specififying destination directory but default to current if not provided
function copyFromSrc (fileName) {
  const sourceFile = `${sourceDir}/${fileName}`
  const destFile = `${currentDir}/${fileName}`
  
  fs.copyFile(sourceFile, destFile, (err) => {
    if (err) throw err
    console.log(`Created ${fileName}`)
  })
}