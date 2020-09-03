# Vue Components IDE Helper
Can be used to generate JS import and Vue.component() statements for all files in a folder.

## Explanation

Your setup may utilise Webpack's `require.context()` feature to scan a dedicated folder for Vue Components and register them with Vue. This is useful, as with such setup there is no need to manually register your global Vue Components. They are available to be used just by adding them to the dedicated global components' folder.

However, in most cases IDEs' static code analysis facilities fail to process the complex expressions required to make such setups work. This means you may end up without code completion and/or warnings about unknown components in your IDE when using the auto-registered global Vue Components, even thought they work perfectly fine in the built application.

This small utility attempts to solve that problem in the following way:
* it looks at your global components folder
* finds all .vue files in there
* generates a `.js` file which:
  * imports all of these Vue Components
  * registers all of them with Vue
  
The purpose of the output `.js` file is not to be executed (even though it could be). The purpose of this file is to be indexed by the IDE and used for code completion.

## Usage

### Installation
Clone / download the project into any folder or install using npm, e.g.: `npm install --save-dev https://github.com/BenceSzalai/vue-components-ide-helper.git`

### Execution
* If installed as a node (dev) dependency, use one of these:
  * `$(npm bin)/vue-components-ide-helper <args>`
  * `node node_modules/.bin/vue-components-ide-helper <args>`

* In the folder of the package, use one of these:
  * `node . <args>`
  * `npm run generate -- <args>`
  
Where `<args>` is the placeholder for the command arguments, e.g.: `-s /path/to/src/components/global -o "path/to/output/file.js -r ../src/components/global`

### Automation

It is recommended to set up a file watch either in your IDE or using [npm-watch](https://www.npmjs.com/package/npm-watch) to run the above command every time there is a change made to the `components/global` folder.

## Example case

* Webpack is set up to automatically import and register all Vue Components in the `components/global` folder
* `vue-components-ide-helper` is installed using `npm`
* Create a `.ide-helper` folder in your project and make sure it is included in your IDE's indexing
* Run in the `project-root` folder:
`$(npm bin)/vue-components-ide-helper -s $(pwd)/src/components/global -o .ide-helper/components.js -r ../src/components/global`

Now your project looks like this:
```
project-root
├── .ide-helper
│   └── components.js
├── src
│   ├── components
│   │   └── global
│   │       ├── Component1.Vue
│   │       └── Component2.Vue
│   └── ...
├── node_modules
│   └── ...
```

And `components.js` contains this:
```
import Component1 from '../src/components/global/Component1.vue'
import Component2 from '../src/components/global/Component2.vue'

export default async ({ Vue }) => {
  Vue.component('Component1', Component1)
  Vue.component('Component2', Component2)
}
```

This means your IDE can read `.ide-helper/components.js` and understand the details of the global Vue components.


## Additional info

If you are interested how to set up Webpack's `require.context()` feature, check out these resources:
* https://vuejs.org/v2/guide/components-registration.html#Automatic-Global-Registration-of-Base-Components
* https://webpack.js.org/guides/dependency-management/#requirecontext
