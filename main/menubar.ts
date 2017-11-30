import { dialog, Menu } from 'electron';

import { IO } from './fileIO';

const openOptions = {
  filters: [
    { name: 'Map File/Package (.map, .zip)', extensions: ['map', 'zip'] },
  ]
};

export const saveMapOptions = {
  filters: [
    { name: 'Map File (.map)', extensions: ['map'] },
  ]
};

export const savePackageOptions = {
  filters: [
    { name: 'Map Package (.zip)', extensions: ['zip'] },
  ]
};

/**
 * Builds the menubar with specified labels at the top left of window
 * On label click, sends appropriate command
 * @param window
 */
export function buildMenu(window: Electron.WebContents): void {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          click() { window.send('menu:file:new'); }
        },
        {
          label: 'Load Map/Package',
          async click() {   // declare async because opening files takes a long time
            dialog.showOpenDialog(openOptions, (paths: string[]) => {
              if (paths === undefined) return;

              console.log(paths[0]);
              IO.loadMap(window, paths[0]);
            });
          }
        },
        {
          label: 'Save Map',
          click() {
            window.send('menu:file:map');
          }
        },
        {
          label: 'Save Map As...',
          async click() {
            dialog.showSaveDialog(saveMapOptions, (filePath) => {
              if (filePath) {
                console.log(filePath);
                window.send('menu:file:map', filePath);
              }
            });
          }
        },
        {
          label: 'Save Package',
          click() {
            window.send('menu:file:savepackage');
          }
        },
        {
          label: 'Save Package As...',
          async click() {
            dialog.showSaveDialog(savePackageOptions, (filePath) => {
              if (filePath) {
                console.log(filePath);
                window.send('menu:file:savepackage', filePath);
              }
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
