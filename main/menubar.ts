import { Menu, dialog } from 'electron';
import { IO } from './fileIO';

const options = {
  filters: [
    { name: 'Map File (.map)', extensions: ['map'] }
  ]
};

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
          async click() {   // declare async because opening files taes a long time
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
            dialog.showSaveDialog(options, function (filePath) {
              if (filePath) {
                console.log(filePath);
                window.send('menu:file:save', filePath);
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
