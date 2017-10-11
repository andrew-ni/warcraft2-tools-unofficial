import { app, Menu } from 'electron';

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
          click() { window.send('menu:file:open'); }
        },
        {
          label: 'Save Map',
          click() { window.send('menu:file:save'); }
        },
        {
          label: 'Save Map As...',
          click() { window.send('menu:file:saveAs'); }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
