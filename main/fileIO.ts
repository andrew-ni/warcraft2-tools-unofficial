import { dialog } from 'electron';
import * as fs from 'fs';

// Module is like a namespace so we don't polute the global space
export module IO {
  // Note it is async, opening files take a long time and we don't want to block the thread
  export function loadMap(window: Electron.WebContents) {
    console.log('loadMap');

    const options = {
      filters: [
        { name: 'Map File', extensions: ['map'] }
      ]
    };

    // showOpenDialog is Electron
    // This will open a dialog for the user
    // The second argument is an anonymous callback function that takes an array of strings
    dialog.showOpenDialog(options, (paths: string[]) => {
      if (paths === undefined) return;

      console.log(paths[0]);

      // fs.readFile is Node
      // We only handle opening a single map file so we only look at `path[0]`
      fs.readFile(paths[0], 'utf8', (err: Error, data: string) => {
        if (err) {
          console.log(err);
        } else {
          window.send('map:loaded', data);
        }
      });
    });
  }
}


// Note: in menubar.ts, it is not necessary for all the items to be bound to ipc messages eg. window.send()
/*

something like this should work

{
  label: 'Load Map',
  click() {
    IO.loadMap(window);
   }
},


*/
