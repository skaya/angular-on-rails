# Angular 2 on Rails using Webpack
This simple application is about how to adapt Angular 2 and Ruby on Rails to get them working together with Webpack help. It's mostly about setting up and configuring the Frontend environment to be a part of a Ruby on Rails application. During the implementation, I ran into many questions and problems. I did a lot of research and thinking about choosing right approach and better tools, about creating more flexible and clear design of the app. So possibly this example could help someone to start using Angular 2 on Rails and save some time.

As a building tool, I chose Webpack. There are a few ways to setup it on a Rails app. The simplest and the most popular way is using `webpack-rails` gem (as well as `angular2-rails` gem). Nevertheless, I'll go with another approach, in which two different applications (the Backend and Frontend apps) will be served separately. The Backend app is a typical Rails application that builds static pages, can expose some API endpoints and give JSON output. The Frontend app is an Angular2 application that built by Webpack and running on NodeJS. Obviously, implementation of this approach needs much more work, but it's worth it, and there are some advantages:

* NodeJS is the natural environment for JS libraries like React, Angular, etc.;
* It's easy to write ES6 code in any application;
* You don’t need to care about version compatibility of Rails and JS libraries (for example, `angular2-rails` gem requires Rails 5 and can't be used with Rails 4);
* You still be able to maintain the natural behavior of an asset pipeline without messing it up with Sprockets;
* Using the npm-based package management workflow works better and more productive if you want to leverage the latest version(s) of JS libraries;
* Making an API enables building other clients apps what's a good idea anyway;
* Server-side rendering of components is much faster.

How to configure the Webpack and work with two servers together described in the chapter "[Integrating Angular 2 with Rails](#integrating-angular-2-with-rails)".

Also the chapter "[Sparkling Angular components](#sparkling-angular-components)" discloses the problem of using Angular 2 for non-SPA (Single Page Application) what is not such trivial as could be thought.

### Table of contents
- [Setting up a Rails app](#setting-up-a-rails-app)
- [Setting Up a Frontend environment](#setting-up-a-frontend-environment)
    - [Initialization](#initialization)
    - [Packages installing](#package.json)
    - [Configuration files](#configuration-files)
    - [Installing](#installing)
- [Integrating Angular 2 with Rails](#integrating-angular-2-with-rails)
    - [Webpack configuration](#webpack-configuration)
    - [Proxy server](#proxy-server)
    - [Foreman configuration](#foreman-configuration)
- [Designing the Angular architecture on Rails](#designing-the-angular-architecture-on-rails)
    - [Angular app architecture](#angular-app-architecture)
    - [Sparkling Angular components](#sparkling-angular-components)
    - [Design of Angular pieces](#design-of-angular-pieces)






## Setting up a Rails app
Note: `ruby`, `rails` and `git` have to be installed.  
If you already have a working Rails application, go to the next chapter "[Setting Up a Frontend environment](#setting-up-a-frontend-environment)".

#### Creating skeleton of a Rails app
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
To generate an empty controller run the command `$ rails generate controller pages` and then add a few actions in the generated file:
``` ruby
# /app/controllers/pages_controller.rb
def home
end

def profile
end
```

The new actions require some routes that have to be added to the `/config/routes.rb` file:
``` ruby
root to: "pages#home" #setting the root path of the app.

controller: pages do
    get: profile
end
```

The final step for setting up the Rails app is creating views with some
content for the actions created above (`/app/views/pages/home.html.erb`,
`/app/views/pages/profile.html.erb`).  After that, the skeleton of Rails app
is ready to use and can be visited on `http://localhost:3000` after running
the local server: `rails s`.


  

  
## Setting Up a Frontend environment
Note: `npm` and `node` have to be installed.

### Initialization
Any project has some list of needed packages and the file `package.json` helps to manage them. This file gives `npm` information about using packages and their dependencies. It's created after initialization of `npm` with the command `$ npm init`. During the process, you’ll be asked a couple questions about the project, author, version, etc. At the end of the initialization, the  file `package.json` will be created and should look similar to the following:
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
    "url": "git+https://github.com/skaya/rails-angular.git"
  },
  "author": "Yuliya Kanapatskaya",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/skaya/rails-angular/issues"
  },
  "homepage": "https://github.com/skaya/rails-angular#readme"
}
```

### Package.json

#### A little theory about `package.json`
As I mentioned above, the `package.json` contains a list of packages your project depends on. There are two ways to install a package: using the command line and listing the package name in the `package.json`.  
Besides, three types of dependencies are possible:
- *dependencies* (needed for production) `npm install [package-name] --save` 
- *devDependencies* (used for development and testing only) `npm install [package-name] --save-dev` 
- *global* (used for globally installing) packages `npm install [package-name] --global` 

Some packages come from scopes. Scopes are like a namespace for `npm` modules. Scope name begins with @ symbol. Name of a scoped package forms using the scope name with the package name following after the slash `@scope-name/package-name`. This syntax is used everywhere you need to specify a scoped package, either `package.json`, command line or require statements:
``` console
npm install @scope-name/package-name —save
```
``` js
var packageName = require(“@scope-name/package-name”)
```
- - -
#### Packages installing
To get started we have to install `webpack` and [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html) both globally and in the project. The global installing is necessary to be able to use the webpack commands. The local version specifies the webpack version used on a project. The small difference between installing `webpack` and `webpack-dev-server` is that local version of *webpack-dev-server* should be installed only in `devDependencies` and not in dependencies for production:
```
npm install webpack --global
npm install webpack --save
npm install webpack-dev-server --global
npm install webpack-dev-server --save-dev
```

All needed packages could be installed using this way. The other easiest option to do that is to copy all the following dependencies and paste it to your `package.json`:
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
Note: In addition to global `webpack` and `webpack-dev-server` packages, the following packages also have to be installed **globally** : `npm install -g typescript tslint typings`.

Now it's time for a little information about what is all these packages and why do we need them.

#### What is these packages
Angular 2 comes with the following **required dependencies** :
* *reflect-metadata* - for enabling dependency injection through decorators
* *es6-shim* - library for ES6 compatibilities
* *rxjs* - a set of libraries for reactive programming
* *zone.js* - for implementing zones in JS. Angular 2 uses it to detect changes effectively.

Also, Angular 2 needs some feature packages which give the application utility capabilities. Feature packages are the bone of the Angular 2 framework that provides HTML controls, themes, data access, and various utilities. Details about the packages you can get from [angular guide](https://angular.io/docs/ts/latest/guide/npm-packages.html). I use the following feature packages:
* “@angular/common"
* "@angular/compiler"
* "@angular/core": "^2.4.0",
* "@angular/forms": "^2.1.2",
* "@angular/http": "^2.0.2",
* "@angular/platform-browser": "^2.1.2",
* "@angular/platform-browser-dynamic": "^2.1.2",

Angular 2 is written in TypeScript but that doesn't mean you have to use it. By the way, TypeScript bring the real Object Oriented web Development and I absolutely love this style. Thus TypeScript package will be installed along with typings and tslint (these packages have to be installed globally and locally).

All other packages are **loaders** which described below.

### Configuration files
Three files have to be created in the root directory in order to setup TypeScript for an Angular 2 application:
* typings.json
* tsconfig.json
* tslint.json

##### typings.json
This file is used to configure the TypeScript dependencies when the packages are installed.
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

##### tsconfig.json
This file contains configuration for the TypeScript behavior in the Angular 2 application.
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

##### tslint.json
This file contains a set of rules used for checking TypeScript code. These rules are about readability, maintainability, and functionality errors and adjustable for personal needs.
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

### Installing
For applying all this configuration made before (including packages installing), run `npm install`.
Once the command has completed, a new directory named `node_modules` will appear in the root of the application. This folder stores all installed packages.












## Integrating Angular 2 with Rails
As I mentioned at the beginner of the README, in this app I'll go with a hybrid approach using the Rails and Angular applications separately. Thus the Rails asset pipeline will not be mixed up with AngularJS.

Because of Angular 2 will live independent on Rails, it would be better to put it in a separate directory where all its files will be placed (I gave this folder name `frontend`). In other words, instead of putting an Angular code into the Rails asset pipeline (`app/assets`), the Angular 2 app will be located in the Rails application's public directory. That separates Angular logic from the Rails one (take a look to the file structure in the chapter [Designing the Angular architecture on Rails](#designing-the-angular-architecture-on-rails)).

To build all Angular files and prepare them for using on Rails I chose Webpack. Then `Foreman` and proxy server help us to run Rails and Webpack servers together.


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
* the entry key defines the main file(s) in our application where all the dependencies will be loaded in the order of appearing in the code.
* the output key defines the name and location of the compiled file.
* the module loaders define loaders used in our modules (HTML, Sass, CSS, etc.)

I have two entry files and two relevant output files. Vendor file contains third party libraries [required for Angular2](#what-is-these-packages) that are actually static for an application. App file includes all developed modules and needed packages. That will allow us to do application updates without redownloading the vendor's bundle again.
As a result of compilation, I'll get two files: `app-bundle.js` and `vendor-bundle.js`. The compiled JavaScript bundles can be simply included to Rails templates as a normal JS files:
```
<%= javascript_include_tag ‘/frontend/vendor-bundle.js', :defer => true  %>
<%= javascript_include_tag '/frontend/app-bundle.js', :defer => true %>
```
I use the following list of loaders:
* *angular2-template-loader* loads components' template and styles.
* *html-loader* turns html templates to a string.
* *file-loader* bundles images and fonts.
* *sass-loader* turns scss files into plain css.
* *css-loader* takes the css file and returns the css code.
* *style-loader* takes css and inserts it into the page
* *to-string-loader* is needed in some cases when styles are used as a string.

To enable requiring files without specifying the extension, you should add the parameter "*resolve.extensions*" with a list of using extensions:
``` js
resolve: {
    extensions: ['', '.js', '.ts']
}
```

With this configuration, you'll be ready to run the webpack server `webpack-dev-server --config ./webpack.config.js`. To do life simpler, you can add a new script to `package.json` like this:
``` js
"start": "webpack-dev-server --config ./webpack.config.js",
```
After that, the command `npm start` will be available for starting the server.
Despite the fact that we have not yet finished the setting up of the Angular application, it's possible to run the server (using the command `npm start`) for starting the compilation and watching the app while you'll be setting up an angular environment and developing new components.

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
To use Rails and Node servers together, a proxy server should be created. So, technically we need to run two servers (Backend and Frontend ones) and then proxy all Backend calls to the Backend server on another port as well as doing the same for Frontend calls. The following `http-proxy.js` script does that:
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
It listens on port 5100 for incoming HTTP requests and proxies them to the port :8080 if the request came from `/frontend` path (Angular 2 app location) or to port :3000 for all other requests.

Then this proxy file will be used in `Foreman`



### Foreman configuration
Because I use a hybrid system that utilizes both the Rails and Node server, we need to run two servers side-by-side: the Frontend `webpack-dev-server` and the Backend Rails server. `Foreman` is the helpful tool for running a few servers with just one command.

To use it, firstly, the `foreman` gem needs to be installed:
``` console
$ gem install foreman
```
`Foreman` uses configuration file `Procfile` located in the root directory. This file contains list of processes with the commands used to run them. After that, the command `$ foreman start` will be able for running my servers togethr with the created proxy server.
  
My `Procfile` looks like this:
```
js: npm start
proxy: node http-proxy.js
platform: bundle exec rails s
```

Terminal log of the running process should look something similar:
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






## Designing the Angular architecture on Rails

### Angular app architecture
As I mentioned before ([Webpack configuration](#webpack-configuration)) there are two main files included to Rails templates: `vendor.ts` (bundles libraries required for Angular 2) and `app.ts` (bootstraps the root Angular module `app.module.ts`).

##### app.module.ts
`app.module.ts` imports all needed for application elements (modules, services, components, etc.) and identifies itself as an Angular Module using the `@NgModule` decorator. `@NgModule` takes a metadata object with a list of imported Classes and tells Angular how to compile and launch the application (details read on https://angular.io). This metadata object specifies different arrays of data:
* imports -> array of modules
* declarations -> array of components, directives and pipes
* bootstrap -> array of bootstrapped components
* providers -> array of services

``` ts
// importing Modules
import { BrowserModule }            from '@angular/platform-browser';
import { NgModule }                 from '@angular/core';
import { HttpModule }               from '@angular/http';

// importing Components
import { AppComponent }             from './components/app/app.component';
import { Component1 }               from './components/comp1/comp1.component';

// importing Sevices
import { AppService }             from './service/app/app.service';

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
Pay attention to the naming convention used for Angular elements. The name of almost all Angular files includes a unique name followed by its "data type". So these names are formed according to the pattern `[name].[type].ts` (for example, `app.service.ts`, `app.component.ts`, ` app.module.ts`). This rule makes code reading easier and more clear during developing.

Also as you see from the code above (take a look to 'bootstrap' property in the `@NgModule` decorator), it's possible to bootstrap a list of components although almost all tutorials and documentations propose to bootstrap the only one root component. The single bootstrapped component is needed when you create a Single Page Application what is not applicable to us. Our application is a multiple-page application with Angular components spread across the pages. And there are some pitfalls with using Angular 2 for this kind of apps ([Sparkling angular components](#sparkling-angular-components))
 
Angular 2 uses component approach. It's why I recommend serving every component into its own directory. The directory can contain the only one file which describes the component logic including its styles and template. But if this template or stylesheet has more than 5-10 lines of code, it's preferred to move the code into the separate file and attach it in the `@Component` decorator using `require` statement. In this case, the separate folder works very well because it joins all files which used only for one component and not for others.

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
│   │     \──app/                         * App component's folder
│   │     │     ├──app.component.html     * Templete for the component in app.component.ts
│   │     │     ├──app.component.scss     * Stylesheets for the component in app.component.ts
│   │     │     └──app.component.ts       * Angular App component
│   │     \──comp1/                       * Comp1 component's folder
│   │           ├──comp1.component.html   * Templete for the component in comp1.component.ts
│   │           ├──comp1.component.scss   * Stylesheets for the component in comp1.component.ts
│   │           └──comp1.component.ts     * Angular Comp1 component
│   │
│   \──modules/                           * Angular modules
│   \──models/                            * Typescript interfaces
│   \──services/                          * Angular services
│   │
│   ├──app.module.ts                      * The root Angular module
│   ├──app.ts                             * Angular bootstrapping file
│   ├──helper.dinamicDeclaration.ts       * helper used for dinamic components declaration (read below)
│   └──vendor.ts                          * bundles libraries required for Angular2 
│
├──Procfile                * Foreman configuration file
├──typings.json            * TypeScript dependencies configuration file
├──tslint.json             * TypeScript rules for code checking
├──tsconfig.json           * TypeScript behavior configuration file
├──package.json            * List of using dependencies
└──webpack.config.js       * Webpack main configuration file
```

### Sparkling Angular components
During integrating Angular 2 to Rails app, I ran into some interesting problem. The problem is about using Angular 2 within a static app that doesn't require the entire site to be rendered as a SPA (Single Page Application). The pages of my app are effectively static HTML (though they are rendered by Rails) and I needed to drop Angular components into the page in places. There is no routing at all on the Angular side. I needed to have a kind of mix of static content with dynamic angular components sprinkled within. But Angular 2 revolve around the idea of all components live within a single root component. After a lot of digging, it turns out there is no clear way to implement the sprinkling.

At first sight that looks possible by adding all of the components to the bootstrap array of a `@NgModule` decorator which then passes to `platformBrowserDynamic()`. And that works well when all selectors are present on the page.  However, if you don’t have all bootstrapped components on the page, you’ll see the error `EXCEPTION: The selector “comp2" did not match any elements`. The error occurs because when you bootstrap components in the decorator, they are required, and the error will be thrown if some component is not found on the page. At the same time, the Angular components are not rendered unless they haven't been bootstrapped.

So it would be great to find a way to bootstrap components optionally. Unfortunately, Angular 2 doesn’t provide documented way to do that. Thus I had to write some helper to implement this conditional bootstrapping. The helper works with the list of all components, gets their selectors, checks whether some component is on the page using simple `querySelector()` method and then bootstrap the component if it's found.
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

To use this helper, it has to be imported to the `app.module.ts` and a new instance of the Class should be created. Then list of all components passes to the helper's setter and its getter returns the filtered list of components which could be bootstrapped:
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
Pay attention that the nested components don't need to be bootstrapped, they have to be only declared. It's why I use different arrays for nested and bootstrapped component.

The one more interesting fact is that Angular 2 application must have at least one bootstrapped component otherwise the following error will be thrown: `EXCEPTION: The module AppModule was bootstrapped, but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. Please define one of these`. So using Angular 2 for an MPA you can't have there a page without al least one component. Fortunately, this problem is solved very easy by including some component to common html layout of your application. For this purpose, I used app component `<app></app>` that do nothing and just present on all pages in the footer. 

### Design of Angular pieces
At last, I'll give examples of different Angular elements to demonstrate how these pieces works together. So this examples are not about how to develop logic of components, services, etc., but about communication of the pieces to get working application.
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
That's it. Now the module can be used everywhere you need it.

#### Services
To be able use some Service in your application, the Service have to be Injectable:
``` ts
// frontend/services/myService.service.ts
import { Injectable } from '@angular/core';
...

@Injectable()
export class MyService {
  ...
}
```
Then the Service should be imported in `app.module.ts` and specified in `@NgModule.providers`:
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

To use the Service in some Component, it should be imported there and passed in constructor:
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

  // this._myService will reffer to the imported service
  ...
}


```

#### Models
TypeScript provides the way for creating custom data types called Interfaces:
``` ts
//frontend/models/myInterface.model.ts
export class MyInterface {
    id: number;
    name: string;
    description: string;
    created_at?: Date;
}
```
To use this model, you just need to import it in any script (Components, Services, etc.) where the model needs to be used.

#### Components
Developed Components should be imported in `app.module.ts` and specified in `@NgModule.declarations` as well as in `@NgModule.bootstrap` if the Component is not the nested one.
Due to the fact that I use the helper for dinamic Component bootstrapping, all Components should be passed to dinamicDeclaration function. Nested Components also should be listed in `nestedComponents` array.
``` ts
import { BrowserModule }       from '@angular/platform-browser';
import { NgModule }            from '@angular/core';
...

import { dinamicDeclaration }  from './helper.dinamicDeclaration';

import { AppComponent }        from './components/app/app.component';
import { Comp1 }               from './components/comp1/comp1.component';
import { NestedComp1 }         from './components/comp1/nestedComp1.component';

...

// component which have to be declared
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
The Component script itself have to import at least one required decorator `@Component` where two required Metadata Properties have to be specified: template and selector.
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


#### Templates and assets
Component's templates and stylesheets can be set in different ways: requiring the files, specifying the file urls or including content as a string:
```
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
Pay attantion the required stylesheet file should not be specified in 'style' Metadata Property of `@Component`


```
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

```
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



Including assets file from frontend/assets:
```
@import "~stylesheets/common";

comp1 {
    background: url('~images/77d87585e192.jpg');
}
```

```
<h4>Headline</h4>
<p>hello from component 1</p>
<img src="~images/77d87585e192.jpg"/>
```
