# ECS160Tools
ECS 160 Project Tools


# Getting Started
You will need [Node](https://nodejs.org/en/download/current/) 7.9 or above, and [Git](https://git-scm.com/download/) installed.

```
git clone https://github.com/UCDClassNitta/ECS160Tools.git
cd ECS160Tools
npm install
npm start
```


It is highly recommended to use [Visual Studio Code](https://code.visualstudio.com/) as your IDE. It has built in support for TypeScript and TSlint which makes writting TypeScript a pleasure.

# Technologies
- [Node](https://nodejs.org/en/about/): a JavaScript runtime built on Chrome's V8 JavaScript engine
- [Electron](https://electron.atom.io/): a framework built on Node and Chromium for creating cross-platform native applications
- [Angular](https://angular.io/docs): a TypeScript-base front-end web application platform by Google
- [TypeScript](https://www.typescriptlang.org/): a typed superset of JavaScript that compiles to plain JavaScript
- [SASS/SCSS](http://sass-lang.com/): an extension of CSS that adds power and elegance to the basic language

# Introduction
Electron is what enables the app to run natively on all platforms. 
Here's a [primer](https://youtu.be/8YP_nOCO-4Q) on its features.
An electron app consists of two (or more) threads. The first is the Main Process and the other is a Renderer Process. Read more about them in the [Quick Start](https://electron.atom.io/docs/tutorial/quick-start/). Electron provides a way to display the GUI but it doesn't handle any of the GUI creation itself. For that, many frameworks exist that help create the user interface such as [React](https://reactjs.org/), [Vue](https://vuejs.org/), and of course [Angular](https://angular.io/) (not to be confused with the older [AngularJS](https://angular.io/guide/ajs-quick-reference)). We will be going with Angular for its support of TypeScript (here's an [video](https://www.youtube.com/watch?v=rAy_3SIqT-E), and the [handbook](https://www.typescriptlang.org/docs/handbook/basic-types.html) on TypeScript). Angular will be used solely in the Renderer Process. Here's an [Intro Video](https://www.youtube.com/watch?v=KhzGSHNhnbI) for Angular.

# Contributing

`dev` is the main development branch of the project. `dev` is a protected branch that prevents direct pushing. In order to merge into `dev` you must first push a new branch with your changes to GitHub and submit a Pull Request (PR). Someone will then review your code and approve the PR for merging.

Please try to follow this [Style Guide](https://github.com/agis/git-style-guide#table-of-contents) when using Git.

#### Sample workflow for making new features/changes:
  1. Checkout `dev` and pull the latest changes from GitHub
     - `git checkout dev`
     - `git pull origin dev`
  2. Make a new branch for your changes
     - `git checkout -b <branch-name>`
  3. Make your changes and commits (There are many commands/options to accomplish this, these are just a few)
     - See what changes you made:
       - `git status`  - Shows the modified files
       - `git diff [<file-name>]` - Shows the modified lines
     - Stage the changes (Choose what changes will be part of the commit)
       - `git add <file-name>` - Add a specific file or pattern
       - `git add -p` - Interactively choose chunks of code to add (My favorite)
       - `git add .` - Add all changes (Use sparingly)
     - Make the commit
       - `git commit -m "<commit-message>"` - When the commit message is short
       - `git commit` - Will open a text editor to enter longer commit messages
  4. Get any new changes from `dev` (It is a good idea to do this throughout the development of your feature as well.)
     - `git pull -r origin dev`
  5. Push your branch to GitHub
     - `git push origin <branch-name>`
  6. Create a pull request on GitHub.
     - `GitHub` > `Pull requests` >  `New pull request` > `compare: <branch-name>` > `Create pull request` > Fill in the description > `Create pull request`

# Code Formatting
TODO