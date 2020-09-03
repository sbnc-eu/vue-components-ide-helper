#!/usr/bin/env node

const upperFirst = require("lodash/upperFirst")
const camelCase = require("lodash/camelCase")
const yargs = require("yargs")
const glob  = require("glob")
const fs = require('fs');

const options = yargs
  .usage("Vue Component IDE helper\nUsage: -s <source_folder> -t <target_file> -r <relative_base>")
  .example([
    ['$0 -s "/full/path/to/src/components/global" -o "path/to/output/file.js', 'Basic usage'],
    [''],
    ['$0 -s "/full/path/to/src/components/global" -o "path/to/output/file.js -r "../src/components/global/', 'Use specified relative path for the imports in the output file.'],
  ])
  .option("s", { alias: "sources",  describe: "The path to look for files under", type: "string", demandOption: true })
  .option("o", { alias: "output",   describe: "The path to write the generated file as", type: "string", demandOption: true })
  .option("r", { alias: "relative", describe: "Use this as the path in the output file instead of the source path.", type: "string", demandOption: false })
  .epilogue('for more information, find our manual at http://example.com')
  .argv;


const getDirectories = function (src, callback) {
  glob(src + '/**/*', callback);
};

// Need to generate this:
/*
import ComponentName     from '../src/components/global/ComponentName'
export default async ({ Vue }) => {
  Vue.component('ComponentName',     ComponentName)
}
*/

var imports = ''
var registrations = ''

console.log('Found modules:')

getDirectories(options.sources, function (err, file_paths) {
  if (err) {
    console.log('Error', err);
    return;
  }

  file_paths.forEach(( path ) => {

    // Get PascalCase name of component
    const componentName = upperFirst(
      camelCase(
        // Gets the file name regardless of folder depth
        path
          .split('/')
          .pop()
          .replace(/\.\w+$/, '')
      )
    )
    console.log(`${path} => ${componentName}`);

    if ( options.relative ) {
      path = path.replace(options.sources, options.relative)
    }

    imports       += `import ${componentName} from '${path}'\n`
    registrations += `  Vue.component('${componentName}', ${componentName})\n`

  })

  var output = `${imports}\nexport default async ({ Vue }) => {\n${registrations}}`

  fs.writeFile(options.output, output, function(err) {
    if(err) {
      return console.log(err);
    }
    console.log(`\nWritten new file to:\n${options.output}`)
  });

});
