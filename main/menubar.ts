import { dialog, Menu } from 'electron';

import { IO } from './fileIO';

const options = {
  filters: [
    { name: 'Map File (.map)', extensions: ['map'] }
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
          label: 'Load Map',
          async click() {   // declare async because opening files takes a long time
            dialog.showOpenDialog(options, (paths: string[]) => {
              if (paths === undefined) return;

              console.log(paths[0]);
              IO.loadMap(window, paths[0]);
            });
          }
        },
        {
          label: 'Save Map',
          click() {
            window.send('menu:file:save');
          }
        },
        {
          label: 'Save Map As...',
          async click() {
            dialog.showSaveDialog(options, (filePath) => {
              if (filePath) {
                console.log(filePath);
                window.send('menu:file:save', filePath);
              }
            });
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Edit Tileset',
          click() { window.send('menu:file:tileset'); }
        },
        {
          label: 'Edit Sprites/Animation',
          click() { window.send('menu:file:animation'); }
        },
        {
          label: 'Edit Audio',
          click() { window.send('menu:file:audio');}
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
