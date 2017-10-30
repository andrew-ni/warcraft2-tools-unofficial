import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { buildMenu } from './main/menubar';
import { IO } from './main/fileIO';

const url = require('url');

let mainWindow: Electron.BrowserWindow;
let devTools: boolean;

function start() {
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  const args = process.argv.slice(1);
  const serve = args.some(val => val === '--serve');
  devTools = args.some(val => val === '--dev');

  if (serve) require('electron-reload')(__dirname, {});
}

async function createWindow(openDevTools: boolean) {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  // create menubar
  buildMenu(mainWindow.webContents);

  mainWindow.maximize();
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  if (openDevTools) mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => createWindow(devTools));

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow(devTools);
  }
});


start();

// save map file
ipcMain.on('map:save', (event: Electron.IpcMessageEvent, data: string, filepath: string) => {
  IO.saveMap(data, filepath);
});

ipcMain.on('map:load', (event: Electron.IpcMessageEvent, filepath: string) => {
  IO.loadMap(mainWindow.webContents, filepath);
});

ipcMain.on('terrain:load', (event: Electron.IpcMessageEvent, terrainFilePath: string, mapFilePath: string) => {
  IO.loadTerrain(mainWindow.webContents, terrainFilePath, mapFilePath);
});
