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