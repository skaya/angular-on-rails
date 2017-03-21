# README

# Dependencies
You need to have installed the following:
1. node and npm
2. ruby and rails
3. git
4. bundler





# Setting up a Rails app
```
$ rails new rails-angular
$ cd rails-angular
$ rails db:create
```

## Init Git
```
echo "# rails-angular" >> README.md
git init
git add .
git commit -m "app initialization"
Create new repository in Github
git remote add origin git@github.com:skaya/rails-angular.git
git push origin master
```

## Prepare some data:
```
$ rails generate controller pages
```

open this file (its location is: app/controllers/pages_controller.rb) with your text editor and add two actions to it
```
def home
end

def profile
end
```

Create two views (views/pages/home.html.erb, views/pages/profile.html.erb) with some content.

Add to /config/routes.rb the following:
```
root to: "pages#home"

controller :pages do
    get :profile
end
```

After that we can run rails server with `rails s` and open the simplest app on `http://localhost:3000`


# Integrating Angular 2

Because Angular 2 is a framework and not a library, it would be best if is put in a separate directory where all its files are going to reside. This means that, instead of putting it into the Rails asset pipeline (app/assets), the Angular 2 app will reside in the Rails application's public directory, separated from the compilation and the logic of the Rails application. This will allow us to distinguish the concerns of using the Rails and the Angular 2 applications and their dependencies.

Angular 2 uses TypeScript, a superset of JavaScript. As of today, there isn't a way for TypeScript to be implemented into Rails' asset pipeline, which means that a transpiler has to be configured in the root directory of the Rails application. Transpilers (short for transcompilers ) in JavaScript are tools that read code (or CoffeScript or similar) and transpile it to pure JavaScript that can be interpreted by the browser.


## Setting up the environment for Angular 2
```
npm init
```
After that will be asked questions about the project, author etc and created the package.json file with this info.

You should have a package.json when you're through that looks similar to this:
```
{
  "name": "rails-angular2",
  "version": "1.0.0",
  "description": "AngularJs 2 on Rails using Webpack",
  "main": "index.js",
  "directories": {
    "test": "test"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
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

The package.json file that contains a list of all the packages required to integrate Angular 2 with Rails:
```
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
    "raven-js": "^3.9.1",
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
The file contains typings, a package that is used for configuring the behaviour of TypeScript and the typescript  package itself as devDependencies (dependencies of the dependencies). Obviously, angular2  is also one of the packages as well as libraries such as systemjs  and es6-shim  that add EcmaScript 6 functionality, which is requried for Node 5.


Because of TypeScript's requirements, there are three files that need to be created in the root directory in order for the environment to be set up for an Angular 2 application.
* package.json
* typings.json
* tsconfig.json

#### typings.json
Also in your root directory, create a file named typings.json. This file will be used to configure the dependencies of TypeScript after the packages are installed. You can also configure TypeScript dependencies manually by running typings install in your console.

```
{
  "name": "rails-angular2",
  "dependencies": {},
  "globalDependencies": {
    "es6-shim": "registry:dt/es6-shim#0.31.2+20160602141504",
    "jasmine": "registry:dt/jasmine#2.5.0+20161025102649",
    "node": "registry:env/node#6.0.0+20161105011511"
  }
}
```

#### tsconfig.json
```
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
The file contains standard configuration for the behavior of TypeScript in the Angular 2 application. One thing that requires paricular attention is the rootDir property which defines that the Angular 2 application will reside in the public directory.

#### tslint.json
```
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


After these three files are added to the root directory of the Rails application, write the following command in your console:
```
npm install
```

Wait as the packages are installed. Once the command completes, there will be an extra directory named node_modules in the root directory that will contain the installations of all the packages.


# Integrating AngularJs with Rails
## Webpack configuration
