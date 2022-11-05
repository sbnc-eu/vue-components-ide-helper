#!/usr/bin/env node

const upperFirst = require("lodash/upperFirst")
const camelCase = require("lodash/camelCase")
const yargs = require("yargs")
const glob  = require("glob")
const fs = require('fs');

const options = yargs
  .usage("Vue Component IDE helper\nUsage: -s <source_folder> -t <target_file> -r <relative_base> -v <vue_major_version>")
  .example([
    ['$0 -s "/full/path/to/src/components/global" -o "path/to/output/file.js', 'Basic usage'],
    [''],
    ['$0 -s "/full/path/to/src/components/global" -o "path/to/output/file.js -r "../src/components/global/', 'Use specified relative path for the imports in the output file.'],
  ])
  .option("s", { alias: "sources",  describe: "The path to the global Component files.", type: "string", demandOption: true })
  .option("o", { alias: "output",   describe: "The path to write the generated `.js` file as.", type: "string", demandOption: true })
  .option("r", { alias: "relative", describe: "Use this as the path in the output file instead of the source path.", type: "string", demandOption: false })
  .option("v", { alias: "vue",      describe: "The Vue version to produce the output for.", type: "number", demandOption: false, default: 2 })
  .epilogue('For more information, check out the readme at https://github.com/BenceSzalai/vue-components-ide-helper/')
  .argv;


const getDirectories = function (src, callback) {
  glob(src + '/**/*.[vV][uU][eE]', callback);
};

/*
Need to generate this for Vue 2:
  import ComponentName     from '../src/components/global/ComponentName'
  export default async ({ Vue }) => {
    Vue.component('ComponentName', ComponentName)
}

And this for Vue 3:
  import { createApp } from 'vue'
  import ComponentName     from '../src/components/global/ComponentName'
  const app = createApp({})
  app.component('ComponentName', ComponentName)
*/

if (options.vue !== 2 && options.vue !== 3) {
  throw new Error('Invalid Vue version specified. Only 2 and 3 are supported. Most IDE understands syntax for multiple versions, so try a valid one and open an issue so the tool van be updated!')
}

var imports = ''
var registrations = ''

console.log('Found modules:')

getDirectories(options.sources, function (err, file_paths) {
  if (err) {
    throw new Error(err)
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
    if (options.vue === 2) {
      registrations += `  Vue.component('${componentName}', ${componentName})\n`
    }
    else if (options.vue === 3) {
      registrations += `  .component('${componentName}', ${componentName})\n`
    }

  })

  let output = '//THIS FILE IS GENERATED AUTOMATICALLY. DO NOT EDIT!\n//For more info visit: https://github.com/BenceSzalai/vue-components-ide-helper\n\n'
  if (options.vue === 2) {
    output += `${imports}\nexport default async ({ Vue }) => {\n${registrations}}`
  }
  else if (options.vue === 3) {
    output += `import { createApp } from 'vue'\n\n${imports}\nconst app = createApp({})\n\napp\n${registrations}`
  }
  fs.writeFile(options.output, output, function(err) {
    if(err) {
      throw new Error(err)
    }
    console.log(`\nWritten new file to:\n${options.output}`)
  });

});
