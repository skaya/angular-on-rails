# Angular 2 on Rails using Webpack
This simple application is about how to adapt Angular 2 and Ruby on Rails to get them working together. It's mostly about setting up and configuring a Frontend environment to be a part of a Ruby on Rails application. During the implementation, I ran into many questions and problems. I did a lot of research and thinking about choosing the right approach and better tools, about creating more flexible and clear design of the app. So possibly this example could help someone to start using Angular 2 on Rails and save some time.

When you start a new JS project, firstly, you need to choose a building tool. My choice was made to Webpack. There are a few ways to setup it on a Rails app. The simplest and the most popular way is to use `webpack-rails` gem (as well as `angular2-rails` gem). Nevertheless, I'll go with another approach, in which two different applications (Backend and Frontend) will be served separately. The Backend app is a typical Rails application that builds static pages, can expose some API endpoints and gives JSON output. The Frontend app is an Angular 2 application that is built by Webpack and running on NodeJS. Obviously, implementation of this approach needs much more work, but it's worth it, and there are some advantages:
- NodeJS is a natural environment for JS libraries like React, Angular, etc.;
- It's easy to write ES6 code in any application;
- You don’t need to care about version compatibility of Rails and JS libraries (for example, `angular2-rails` gem requires Rails 5 and can't be used with Rails 4);
- You'll still be able to maintain the natural behavior of Asset Pipeline without messing it up with Sprockets;
- Using the npm-based package management workflow works better and more productive if you want to leverage the latest version(s) of JS libraries;
- Making an API enables building other clients apps what's a good idea anyway;
- Server-side rendering of components works much faster.

How to configure Webpack and work with two servers together described in the chapter ["Integrating Angular 2 with Rails"](#integrating-angular-2-with-rails). Also, the chapter ["Sparkling of Angular components"](#sparkling-of-angular-components) discloses the problem of using Angular 2 for non-SPA websites (not a Single Page Application) what is not such trivial as could be thought.

### Table of contents
- [Setting up a Rails app](#setting-up-a-rails-app)
- [Setting up a Frontend environment](#setting-up-a-frontend-environment)
    - [Initialization](#initialization)
    - [Packages installing](#package.json)
    - [Configuration files](#configuration-files)
    - [Installing dependencies](#installing-dependencies)
- [Integrating Angular 2 with Rails](#integrating-angular-2-with-rails)
    - [Webpack configuration](#webpack-configuration)
    - [Proxy server](#proxy-server)
    - [Foreman configuration](#foreman-configuration)
- [Designing of Angular architecture on Rails](#designing-of-angular-architecture-on-rails)
    - [Angular app architecture](#angular-of-app-architecture)
    - [Sparkling of Angular components](#sparkling-angular-components)
    - [Design of Angular units](#design-of-angular-units)


## Setting up a Rails app
*Note*: `ruby`, `rails` and `git` have to be installed.  
If you already have a working Rails application, go to the next chapter ["Setting up a Frontend environment"](#setting-up-a-frontend-environment).

#### Creating a skeleton of a Rails app
For creating a new Rails application with some database, run the following:
```
$ rails new rails-angular
$ cd rails-angular
$ rails db:create
```

#### Initialize Git
After creating a new repository on GitHub, initialize `git` on your new project:
```
$ echo "# rails-angular" >> README.md
$ git init
$ git add .
$ git commit -m “app initialization"
$ git remote add origin git@github.com:[username]/[projectName]
$ git push origin master
```

#### Prepare some data
Run the command `$ rails generate controller pages` and use the controller's generated file to add a few actions:
``` ruby
# /app/controllers/pages_controller.rb
def home
end

def profile
end
```

These new actions require some routes in the file `/config/routes.rb`:
``` ruby
root to: "pages#home" #setting the root path of the app.

controller: pages do
    get: profile
end
```

The final step for setting up the Rails application is creating views with some content for the actions created above (`/app/views/pages/home.html.erb`,
`/app/views/pages/profile.html.erb`).  After that, the skeleton of the Rails app
is ready to use and can be visited on `http://localhost:3000` after running
the local server: `rails s`.


  














  
## Setting Up a Frontend environment
*Note*: `npm` and `node` have to be installed.

### Initialization
Any project based on NodeJS depends on a list of packages which is managed by the file `package.json`. It gives `npm` information about using packages and their dependencies. This file will be created after `npm` initialization: `$ npm init`. During the process, you’ll be asked a couple questions about the project, author, version, etc. At the end of the initialization, the file `package.json` will appear in the root directory and should look similar to the following:
``` json
{
  "name": "angular2-on-rails",
  "version": "1.0.0",
  "description": "Angular2 on Rails using Webpack",
  "main": "index.js",
  "directories": {
    "test": "test"
  },
  "scripts": {
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/skaya/angular2-on-rails.git"
  },
  "author": "Yuliya Kanapatskaya",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/skaya/angular2-on-rails/issues"
  },
  "homepage": "https://github.com/skaya/angular2-on-rails#readme"
}
```

### Package.json

#### A little theory about `package.json`
As I mentioned above, the `package.json` contains a list of packages your project depends on. There are two ways to install a package: using the command line and listing the package namespace in the `package.json`.  
Besides, three types of dependencies are possible:
- *dependencies* (for production) `npm install [package-name] --save` 
- *devDependencies* (for development and testing only) `npm install [package-name] --save-dev` 
- *global* (for global installation)  `npm install [package-name] --global` 

Some packages come from scopes. Scopes are like a namespace for `npm` modules. A scope name begins with the symbol "@". A name of a scoped package is formed using the scope name with the package name following after the slash: `@scope-name/package-name`. This syntax is used everywhere you need to specify a scoped package, either the `package.json`, the command line or require statements:
``` console
npm install @scope-name/package-name —save
```
``` js
var packageName = require(“@scope-name/package-name”)
```
- - -
#### Packages installing
To get started you have to install `webpack` and [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html) both globally and in a project. The global installing is necessary to be able to use the webpack commands. The local version specifies a webpack version used on a project. The small difference between installing `webpack` and `webpack-dev-server` is that the local version of *webpack-dev-server* should be installed only in `devDependencies` and not in dependencies for production:
```
npm install webpack --global
npm install webpack --save
npm install webpack-dev-server --global
npm install webpack-dev-server --save-dev
```

Each package could be installed using the command line.  
The other easiest option to do that is to copy all the following dependencies, paste it to your `package.json` and run `$ npm install`:
``` json
{
  ..
  "dependencies": {
    "@angular/common": "^2.1.2",
    "@angular/compiler": "^2.1.2",
    "@angular/core": "^2.4.0",
    "@angular/forms": "^2.1.2",
    "@angular/http": "^2.0.2",
    "@angular/platform-browser": "^2.1.2",
    "@angular/platform-browser-dynamic": "^2.1.2",
    "angular2-template-loader": "^0.6.0",
    "css-loader": "^0.25.0",
    "es6-shim": "^0.35.1",
    "file-loader": "^0.9.0",
    "html-loader": "^0.4.4",
    "jasmine-core": "^2.4.1",
    "node-sass": "^3.13.1",
    "reflect-metadata": "^0.1.8",
    "rxjs": "^5.0.0-beta.12",
    "sass-loader": "4.1.0",
    "style-loader": "^0.13.1",
    "to-string-loader": "^1.1.5",
    "ts-loader": "^1.1.0",
    "typescript": "^2.0.8",
    "webpack": "^1.14.0",
    "zone.js": "^0.7.4"
  },
  "devDependencies": {
    "tslint": "^3.15.1",
    "typings": "^2.0.0",
    "webpack-dev-server": "^1.16.2"
  }
}
```
*Note*: `typescript`, `tslint` and `typings` also have to be installed *globally* in addition to their local versions: `$ npm install -g typescript tslint typings`.

Now it's time for a little information about what is all these packages and why I need all of them.

#### What is these packages
Angular 2 comes with the following **required dependencies** :
* *reflect-metadata* is a library for enabling dependency injection through decorators
* *es6-shim* is a library for ES6 compatibilities
* *rxjs* is a set of libraries for reactive programming
* *zone.js* is a library for implementing zones in JS. Angular 2 uses it to detect changes effectively.

Also, Angular 2 needs some *feature packages* which give an application utility capabilities. The feature packages are the bone of Angular 2 framework that provides HTML controls, themes, data access, and various utilities. Details about the packages you can get from [angular guide](https://angular.io/docs/ts/latest/guide/npm-packages.html). I used the following feature packages:
* “@angular/common"
* "@angular/compiler"
* "@angular/core": "^2.4.0",
* "@angular/forms": "^2.1.2",
* "@angular/http": "^2.0.2",
* "@angular/platform-browser": "^2.1.2",
* "@angular/platform-browser-dynamic": "^2.1.2",

Angular 2 is written in TypeScript but that doesn't mean you have to use it. However, it should be emphasized that TypeScript brings real Object Oriented Programming to Web Development what's really great and I love writing code in this style. Thus, in my case, TypeScript package will be installed globally and locally along with `typings` and `tslint` which is the required packages for TypeScript.

All other packages are **loaders** which described below.

### Configuration files
The following three files have to be created in the root directory in order to setup TypeScript for an Angular 2 application:
* typings.json
* tsconfig.json
* tslint.json

**typings.json** It's used for configuring TypeScript dependencies.
``` json
{
  "name": "angular2-on-rails",
  "dependencies": {},
  "globalDependencies": {
    "es6-shim":"registry:dt/es6-shim#0.31.2+20160602141504",
    "jasmine":"registry:dt/jasmine#2.5.0+20161025102649",
    "node":"registry:env/node#6.0.0+20161105011511"
  }
}
```

**tsconfig.json** It contains properties for configuration of a TypeScript behavior in an application.
``` json
{
    "compilerOptions": {
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "module": "commonjs",
        "moduleResolution": "node",
        "noImplicitAny": true,
        "suppressImplicitAnyIndexErrors": true,
        "removeComments": false,
        "sourceMap": true,
        "target": "es5"
    },
    "exclude": [
        "node_modules",
        "typings/main",
        "typings/main.d.ts"
    ]
}
```

**tslint.json** It contains a set of rules used for checking a TypeScript code. These rules are about readability, maintainability, functionality errors and they are adjustable for personal needs.
``` json
{
    "class-name": true,
    "comment-format": [
        true,
        "check-space"
    ],
    "indent": [
        true,
        "spaces"
    ],
    "no-duplicate-variable": true,
    "no-eval": true,
    "no-internal-module": true,
    "no-trailing-whitespace": true,
    "no-var-keyword": true,
    "one-line": [
        true,
        "check-open-brace",
        "check-whitespace"
    ],
    "quotemark": [
        true,
        "single"
    ],
    "semicolon": true,
    "triple-equals": [
        true,
        "allow-null-check"
    ],
    "typedef-whitespace": [
        true,
        {
            "call-signature": "nospace",
            "index-signature": "nospace",
            "parameter": "nospace",
            "property-declaration": "nospace",
            "variable-declaration": "nospace"
        }
    ],
    "variable-name": [
        true,
        "ban-keywords",
        "check-format"
    ],
    "whitespace": [
        true,
        "check-branch",
        "check-decl",
        "check-operator",
        "check-separator",
        "check-type"
    ]
}
```

### Installing dependencies
For applying all this configuration made before (including packages installing), run `$ npm install`.
Once the command has completed, a new directory named `node_modules` will appear in the root of an application. This folder stores all installed packages.
























## Integrating Angular 2 with Rails
As I mentioned at the beginner of this README, in this app I'll go with a hybrid approach of using Rails and Angular applications separately. In this way Rails Asset Pipeline will not be mixed up with AngularJS.

It would be better to put all Angular's files into a separate directory because Angular 2 is going to live regardless of Rails. In other words, instead of putting an Angular code into Rails Asset Pipeline (`app/assets`), a Angular 2 application will be located in a Rails public directory. This way separates Angular logic from the Rails one (take a look to the file structure in the chapter ["Designing of Angular architecture on Rails"](#designing-of-angular-architecture-on-rails), my folder is called `frontend`).

`Webpack` will build all Angular files and prepare them for using on Rails. Then `Foreman` will help to run Rails and Webpack servers together with proxy server help.


### Webpack configuration
Webpack is a module bundler.  It takes modules with all dependencies inside (like JavaScript, stylesheet, images, etc.) and packs them into bundled assets for usage in a browser. To do that, Webpack uses `loaders` that know how to compile different types of dependencies.

Webpack is configurable in the file `webpack.config.js` which has to be created in the root directory. My configuration file looks like this:
``` js
const path = require('path');
const webpack = require('webpack');
const ChunkWebpack = webpack.optimize.CommonsChunkPlugin;

const rootDir = path.resolve(__dirname, '.');

const config = {
    debug: true,
    devtool: 'source-map',
    entry: {
        vendor: [ path.resolve(rootDir, 'frontend', 'vendor') ],
        app: [ path.resolve(rootDir, 'frontend', 'app') ]
    },
    output: {
      path: (process.env.NODE_ENV === 'production') ? path.join(__dirname, 'public', 'frontend') : path.join(__dirname, 'frontend'),
      filename: '[name]-bundle.js',
      publicPath: "/frontend/"
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: 'to-string!style!css'
            },
            {
                test: /\.scss$/,
                loader: 'to-string!style!css!sass'
            },
            {
                test: /\.html$/,
                loader: 'html?-minimize'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file?name=assets/[name].[hash].[ext]',
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts!angular2-template-loader'
            }

        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor-bundle.js")
    ],

    resolve: {
        root: [
            path.resolve('./frontend/assets/')
        ],
        extensions: ['', '.js', '.ts']
    }
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
            compress: { screw_ie8: true }
        })
    )
}

module.exports = config
```
Let's break it down.

This configuration file has three main areas:
* the entry key defines the main file(s) which loads all used dependencies in your application.
* the output key defines a name and a location of the compiled file(s).
* the module loaders define loaders used in your modules (HTML, Sass, CSS, etc.)

I have two entry files and two relevant output files. `vendor.ts` contains third party libraries [required for Angular 2](#what-is-these-packages) which are actually static for an application. `app.ts` includes all developed modules and packages needed for these modules. This file division allows updating an application without redownloading the vendor's bundle.  
As a result of the compilation, I'll get two files: `app-bundle.js` and `vendor-bundle.js`. This compiled JavaScript bundles can be simply included to Rails templates as a normal JS file:
```
<%= javascript_include_tag ‘/frontend/vendor-bundle.js', :defer => true  %>
<%= javascript_include_tag '/frontend/app-bundle.js', :defer => true %>
```
I used the following list of loaders:
* *angular2-template-loader* loads components' template and styles.
* *html-loader* turns html templates to a string.
* *file-loader* bundles images and fonts.
* *sass-loader* turns scss files into plain css.
* *css-loader* takes the css file and returns the css code.
* *style-loader* takes css and inserts it into the page
* *to-string-loader* is needed in some cases when styles are used as a string.

You can require files in your modules without specifying the extension. To be able to do that, you should add the parameter "*resolve.extensions*" with a list of used extensions:
``` js
resolve: {
    extensions: ['', '.js', '.ts']
}
```

With this configuration described below, you'll be ready to run the webpack server `$ webpack-dev-server --config ./webpack.config.js`. To do life simpler, you can add a new script to `package.json` and use it to start the server:
``` js
"start": "webpack-dev-server --config ./webpack.config.js" // '$ npm start' command creating
```

Despite the fact that the Angular app setuping is not finished yet, it's possible to run the server (using the command `$ npm start`) for starting the compilation and watching the app while you'll be working with an angular environment and developing new components.

The Terminal log should look something similar:
``` console
MacBook-Pro:angular2_on_rails yuliyakanapatskaya$ npm start

> rails-angular2@1.0.0 start /Users/yuliyakanapatskaya/angular2_on_rails
> webpack-dev-server --config ./webpack.config.js

 http://localhost:8080/webpack-dev-server/
webpack result is served from /frontend/
content is served from /Users/yuliyakanapatskaya/angular2_on_rails
ts-loader: Using typescript@2.2.1 and /Users/yuliyakanapatskaya/angular2_on_rails/tsconfig.json
Hash: 88bfc3cddeb937a9b4c3
Version: webpack 1.14.0
Time: 9214ms
               Asset     Size  Chunks             Chunk Names
       app-bundle.js  1.55 MB       0  [emitted]  app
    vendor-bundle.js  1.81 MB       1  [emitted]  vendor
   app-bundle.js.map  1.87 MB       0  [emitted]  app
vendor-bundle.js.map  2.17 MB       1  [emitted]  vendor
chunk    {0} app-bundle.js, app-bundle.js.map (app) 1.51 MB {1} [rendered]
```

### Proxy server
To use Rails and Node servers together, a proxy server should be created. Technically, we need to run two servers (Backend and Frontend) and then proxy all Backend calls to the Backend server but on another port. The same should be done for Frontend calls. The following `http-proxy.js` script does that:
``` js
var http = require('http');
var httpProxy = require('http-proxy');

// create a proxy server with custom application logic
var proxy = httpProxy.createProxyServer({});

proxy.on('error', function(err) {
  console.error('[error] ' + err.message);
});

// run the proxy server
var server = http.createServer(function(req, res) {
  var originalUrl = req.url;
  var target;
  var targetUrl = originalUrl;

  if (req.url.indexOf('/frontend') === 0) {
    targetUrl = req.url = req.url.slice(0);
    target = 'http://localhost:8080';
  } else {
    target = 'http://localhost:3000';
  }

  console.log(
    '[http] ' +
    req.method + ' ' + addressPretty(server) + originalUrl + ' -> ' +
    target + targetUrl
  );

  proxy.web(req, res, {
    target: target,
  });
});

server.listen(process.env.PORT || 5100, function(err) {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.log('Proxy server listening on ' + addressPretty(server));
});

function addressPretty(server) {
  var addr = server.address()
  return 'http://' + addr.address + ':' + addr.port;
}
```
It listens for incoming HTTP requests on port `:5100` and proxies them to one of the following port:
- `:8080` if the request came from `/frontend` path (Angular 2 app location) 
- `:5200` for all other requests (which is backend calls).



### Foreman configuration
`Foreman` is a helpful tool for running a few servers with just one command. To use it, firstly, this gem needs to be installed `$ gem install foreman`. Foreman is configurable with the file `Procfile` in the root directory. This file contains a list of processes you want to run. In my case, I need to run Rails, Webpack and Proxy servers, what is specified below:
```
js: npm start
proxy: node http-proxy.js
platform: bundle exec rails s
```
After that, the command `$ foreman start` will be available for running my hybrid system that utilizes both Rails and Node servers. Terminal log of the running process should look something similar:
``` console
MacBook-Pro:angular2_on_rails yuliyakanapatskaya$ foreman start
01:20:24 js.1       | started with pid 26027
01:20:24 proxy.1    | started with pid 26028
01:20:24 platform.1 | started with pid 26029
01:20:24 proxy.1    | Proxy server listening on http://:::5100
01:20:25 js.1       |
01:20:25 js.1       | > rails-angular2@1.0.0 start /Users/yuliyakanapatskaya/Sites/rails+angular2
01:20:25 js.1       | > webpack-dev-server --config ./webpack.config.js
01:20:25 js.1       |
01:20:25 js.1       |  http://localhost:8080/webpack-dev-server/
01:20:25 js.1       | webpack result is served from /frontend/
01:20:25 js.1       | content is served from /Users/yuliyakanapatskaya/Sites/rails+angular2
01:20:26 js.1       | ts-loader: Using typescript@2.2.1 and /Users/yuliyakanapatskaya/Sites/rails+angular2/tsconfig.json
01:20:28 platform.1 | => Booting Puma
01:20:28 platform.1 | => Rails 5.0.1 application starting in development on http://localhost:5200
01:20:28 platform.1 | => Run `rails server -h` for more startup options
01:20:28 platform.1 | Puma starting in single mode...
01:20:28 platform.1 | * Version 3.7.1 (ruby 2.3.3-p222), codename: Snowy Sagebrush
01:20:28 platform.1 | * Min threads: 5, max threads: 5
01:20:28 platform.1 | * Environment: development
01:20:28 platform.1 | * Listening on tcp://localhost:5200
01:20:28 platform.1 | Use Ctrl-C to stop
01:20:36 js.1       | Hash: 88bfc3cddeb937a9b4c3
01:20:36 js.1       | Version: webpack 1.14.0
01:20:36 js.1       | Time: 10326ms
01:20:36 js.1       |                Asset     Size  Chunks             Chunk Names
01:20:36 js.1       |        app-bundle.js  1.55 MB       0  [emitted]  app
01:20:36 js.1       |     vendor-bundle.js  1.81 MB       1  [emitted]  vendor
01:20:36 js.1       |    app-bundle.js.map  1.87 MB       0  [emitted]  app
01:20:36 js.1       | vendor-bundle.js.map  2.17 MB       1  [emitted]  vendor
01:20:36 js.1       | chunk    {0} app-bundle.js, app-bundle.js.map (app) 1.51 MB {1} [rendered]
```
  
















## Designing of Angular architecture on Rails

### Angular app architecture
As I described before (["Webpack configuration"](#webpack-configuration)), two main files are included to Rails template: 
- `vendor.ts` - This script bundles libraries required for Angular 2;
- `app.ts` - This script bootstraps the root Angular module `app.module.ts` which contains everything else not included in `vendor.ts`.

##### app.module.ts
`app.module.ts` imports all needed elements for application (modules, services, components, etc.) and identifies itself as an Angular Module using `@NgModule` decorator. `@NgModule` takes a Metadata object with a list of imported units and tells Angular how to compile and launch the application (details read on https://angular.io). This decorator has a few main properties:
* imports -> array of modules
* declarations -> array of components, directives and pipes
* bootstrap -> array of bootstrapped components
* providers -> array of services

``` ts
// importing Modules
import { BrowserModule }    from '@angular/platform-browser';
import { NgModule }         from '@angular/core';
import { HttpModule }       from '@angular/http';

// importing Components
import { AppComponent }     from './components/app/app.component';
import { Component1 }       from './components/comp1/comp1.component';

// importing Sevices
import { AppService }       from './service/app/app.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  declarations: [ AppComponent, Component1 ],
  bootstrap: [ AppComponent, Component1 ],
  providers: [ AppService ]
})

export class AppModule { }
```
Pay attention to the naming convention used for Angular elements. The name of almost all Angular files includes a unique name followed by its "data type". Suchwise these names are formed according to the pattern `[name].[type].ts` (for example, `app.service.ts`, `app.component.ts`, ` app.module.ts`). This rule makes code reading easier and more clear during developing.

Also as you see from the code above (take a look to 'bootstrap' property in `@NgModule` decorator), it's possible to bootstrap a list of components although almost all tutorials and documentations propose to bootstrap the only one root component. The single bootstrapped component needs when you develop a Single Page Application what is not applicable to me. My application is a multiple-page application with Angular components spreaded across the pages. And there are some pitfalls with using Angular 2 for this kind of applications ([Sparkling of Angular components](#sparkling-of-angular-components)).
 
Angular 2 uses component approach. It's why I recommend to serve every component into its own directory. This directory can contain a component script either alone or with all required files.
The required files are usually template and stylesheet files which is attached to the script using the `require` statement. It's also possible to place their code directly into `@Component` decorator. For me, a decision about choosing the right way is based on the code size: if the code takes more than 5-10 lines, I move it into a separate file. Using separate folder works well because it joins all files used only for one component and not for others.

Thus the final snapshot of the app structure is the following:
```
rails+angular2/
\──app/                     * Rails application folder
\──node_modules/            * Location of installed packages
:..other rails folders and files
\──fronend/                 * FE/Angular app folder
│   \──assets/              * Common assets used for the Angular app
│   │     \──fonts/         * Fonts used for the Angular app
│   │     \──images/        * Images used for the Angular app
│   │     \──stylesheets/   * Common and shared stylesheets used for Angular app
│   │
│   \──components/                        * Angular components
│   │     \──app/                         * 'App' component's folder
│   │     │     ├──app.component.html     * Templete for the component in app.component.ts
│   │     │     ├──app.component.scss     * Stylesheets for the component in app.component.ts
│   │     │     └──app.component.ts       * Angular 'App' component
│   │     \──comp1/                       * 'Comp1' component's folder
│   │           ├──comp1.component.html   * Templete for the component in comp1.component.ts
│   │           ├──comp1.component.scss   * Stylesheets for the component in comp1.component.ts
│   │           └──comp1.component.ts     * Angular 'Comp1' component
│   │
│   \──modules/                           * Angular modules
│   \──models/                            * Typescript interfaces
│   \──services/                          * Angular services
│   │
│   ├──app.module.ts                      * The root Angular module
│   ├──app.ts                             * Angular bootstrapping file
│   ├──helper.dynamicDeclaration.ts       * helper used for dynamic components declaration (read below)
│   └──vendor.ts                          * bundles libraries required for Angular2 
│
├──Procfile                * Foreman configuration file
├──typings.json            * TypeScript dependencies configuration file
├──tslint.json             * TypeScript rules for code checking
├──tsconfig.json           * TypeScript behavior configuration file
├──package.json            * List of using dependencies
└──webpack.config.js       * Webpack main configuration file
```

### Sparkling of Angular components
During integrating Angular 2 in Rails, I ran into some interesting problem. The problem was about using Angular 2 within a static app that doesn't require the entire web-site to be rendered as a SPA (Single Page Application). Pages of my app are effectively static HTMLs (though they are rendered by Rails) and I needed to drop Angular components into the pages in places. There should not be routing on  Angular side at all. I needed to have kind of mix of static content with dynamic angular components sprinkled within it. But Angular 2 revolves around the idea of all components live within the single root component. After a lot of digging, it turned out there is no clear way to implement this sprinkling.

At first sight that looks possible by adding all components to `@NgModule.bootstrap` decorator which is then passed to `platformBrowserDynamic()`. And that works well when all component's selectors are present on a page. However, if at least one of them is not there, you see the error `EXCEPTION: The selector “comp2" did not match any elements`. This error will be thrown when a component is not found on a page because all bootstraped components are required. At the same time, an Angular component is not rendered untill it hasn't been bootstrapped.

So it would be great to find a way to bootstrap components optionally. Unfortunately, Angular 2 doesn’t provide documented way to do that. Thus I had to write some helper to implement this conditional bootstrapping. This helper works with a list of all components, takes their selectors, checks whether some component is on the page using simple method `querySelector()` and then bootstraps the component if it's found.
``` js
//helper.dinamicDeclaration.ts
export class dinamicDeclaration {
  bootstrapingComponent: any[] = [];

  constructor(components: any[]) {
    this.listComponents = components;
  }

  set listComponents(components: any[]) {
    let reflectOjb = window['Reflect'];
    for (let component of components) {
      // getting selector of a component
      let selector = reflectOjb.getMetadata('annotations', component)[0].selector;
      if (document.querySelector(selector)) {
        // the component goes to array for bootstraping
        // only if the selector is present on the page
        this.bootstrapingComponent.push(component);
      }
    }
  }

  get listComponents(): any[] {
    return this.bootstrapingComponent;
  }
}
```


Here is how to use this helper to get a filtered list of components which could be bootstrapped with no errors:
1. Import the helper to the `app.module.ts` 
2. Create a new instance of the helper's Class.
3. Pass a list of all components to the helper's setter
4. Call helper's getter
``` ts
import { dinamicDeclaration }       from './helper.dinamicDeclaration';
...
// component that have to be declared
let declareComponents = new dinamicDeclaration([
    AppComponent,
    Component1,
    Component2
]).listComponents;

// nested components have to be listed here
let nestedComponents: any[] = [
];

@NgModule({
  ...
  declarations: [...nestedComponents, ...declareComponents],
  bootstrap: declareComponents,
  ...
})
```
Pay attention that the nested components don't need to be bootstrapped, they have to be declared only. It's why I used different arrays for nested and bootstrapped components.

The one more interesting fact is that Angular 2 application must have at least one bootstrapped component otherwise the following error will be thrown `EXCEPTION: The module AppModule was bootstrapped, but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. Please define one of these`. So if you use Angular 2 for an MPA, you shouldn't have pages without al least one Angular component. Fortunately, this problem is solved very easy by including some component to common HTML partial which will be rendered for all pages (for example, foote, header, etc.). For this purpose, I used 'app' component (`<app></app>`) that does nothing but it's just presented on all pages in the footer.


### Design of Angular units
In the end, I'll give examples of different Angular units to demonstrate how they work together. So these examples are not about how to develop a logic of components, services, etc., but about communication logic of these pieces to get a working application.

#### Modules
All developed Modules should be imported in the root module `app.module.ts` and specified in `@NgModule.imports` decorator:
``` ts
//app.module.ts
...
import { MyModule } from './modules/myModule/myModule.module';
...
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ...
    MyModule
  ],
  ...
})
....

```
That's it. Now this module ('MyModule') can be used everywhere you need it.

#### Services
To be able to use any Service in your application, this Service have to be injectable what is achieved using corresponding decorator `@Injectable()` into the Service file:
``` ts
// frontend/services/myService.service.ts
import { Injectable } from '@angular/core';
...

@Injectable()
export class MyService {
  ...
}
```
Then the Service have to be imported in `app.module.ts` and specified in `@NgModule.providers` decorator:
``` ts
//app.module.ts
...
import { MyService } from './services/myService.service';
...
@NgModule({
  ...
  providers: [
    MyService,
    ...
  ]
  ...
})
....

```

To use a Service in some Component, it should be imported there and passed into Component's constructor:
``` ts
//frontend/components/comp1/comp1.component.ts

import { Component } from '@angular/core';
import { MyService }  from '../../services/myService.service';

let template = require('./comp1.component.html');
let styles = require('./comp1.component.scss');

@Component({
  selector: 'comp1',
  template: template,
  styles: [ String(styles) ]
})

export class Comp1 {

  constructor(private _myService: MyService) {}

  // this._myService will reffer to the imported Service
  ...
}


```

#### Models
TypeScript provides a way for creating custom data types called Interfaces:
``` ts
//frontend/models/myInterface.model.ts
export class MyInterface {
    id: number;
    name: string;
    description: string;
    created_at?: Date;
}
```
To use this model, you just need to import it into a script where the model needs to be used (Components, Services, etc.).

#### Components
Developed Components should be imported in `app.module.ts` and specified in `@NgModule.declarations` as well as in `@NgModule.bootstrap` if the Component is not the nested one.
Due to the fact that I use my helper for dynamic Component bootstrapping, all Components should be passed to dynamicDeclaration function. Nested Components should be listed in `nestedComponents` array only.
``` ts
import { BrowserModule }       from '@angular/platform-browser';
import { NgModule }            from '@angular/core';
...

import { dinamicDeclaration }  from './helper.dinamicDeclaration';

import { AppComponent }        from './components/app/app.component';
import { Comp1 }               from './components/comp1/comp1.component';
import { NestedComp1 }         from './components/comp1/nestedComp1.component';

...

// component that have to be declared
let declareComponents = new dinamicDeclaration([
    AppComponent,
    Comp1
]).listComponents;

// nested components have to be listed here
let nestedComponents: any[] = [
    NestedComp1
];


@NgModule({
  ...
  declarations: [...nestedComponents, ...declareComponents],
  bootstrap: declareComponents,
  ...
})

export class AppModule { }

```
The Component script itself have to import at least one required decorator `@Component` where two required Metadata Properties have to be specified: template and selector:
``` ts
//frontend/components/comp1/comp1.component.ts

import { Component } from '@angular/core';

...

let template = require('./comp1.component.html');
let styles = require('./comp1.component.scss');

@Component({
  selector: 'comp1',
  template: template,
  styles: [ String(styles) ]
})

export class Comp1 {
  // Component logic is here
  ...
}
```


#### Templates and stylesheets
Below I'll show different ways to set Component's template and stylesheets.

*1. Using require statement:*
``` ts
import { Component } from '@angular/core';

require('./comp1.component.scss');
require('./comp1.component.grid.scss');

let template = require('./comp1.component.html');

...

@Component({
  selector: 'comp1',
  template: template, 
  ...
})

export class Component1 {}
```
Pay attention the required stylesheet file should not be specified in 'style' property of `@Component` decorator. 

*2. Using file Urls:*
``` ts
import { Component } from '@angular/core';

let templateUrl = './comp1.component.html';
let styleUrl1 = './comp1.component.scss';
let styleUrl2 = './comp1.component.grid.scss';
...

@Component({
  selector: 'comp1',
  templateUrl: templateUrl,
  styleUrls: [ styleUrl1, styleUrl2 ]
  ...
})

export class Component1 {}
```

*3. Setting code directly in the decorator:*
``` ts
import { Component } from '@angular/core';

...

@Component({
  selector: 'comp1', 
  template: `<h4>title</h4><p>component 1</p>`,
  styles: [`p {color: pink;}`]
  ...
})

export class Component1 {}
```

#### Assets
Below you'll see a few more examples about specifying assets into templates and stylesheets. Here I use assets files from `frontend/assets` folder when I usually keep shared assets.
``` css
@import "~stylesheets/common";

comp1 {
    background: url('~images/77d87585e192.jpg');
}
```

``` html
<h4>Headline</h4>
<p>hello from component 1</p>
<img src="~images/77d87585e192.jpg"/>
```

That's pretty much everything you need to know to start using Angular on any Rails application.

Happy coding everyone! :)

