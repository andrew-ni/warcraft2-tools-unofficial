import * as fs from 'fs';
import * as path from 'path';

// Module is like a namespace so we don't polute the global space
export module IO {
  // Note it is async, opening files take a long time and we don't want to block the thread
  export async function loadMap(window: Electron.WebContents, filename: string) {
    console.log('loadMap');

    fs.readFile(filename, 'utf8', (err: Error, data: string) => {
      if (err) {
        console.log(err);
      } else {
        window.send('map:loaded', data, filename);
      }
    });
  }

  /*
  TODO: make main thread stateless, have mapservice decide whether a save is valid
        also handle errors
  */

  // Renderer allows us to save
  export async function saveMap(data: string, filepath: string) {
    console.log('saveMap');
    fs.writeFile(filepath, data, () => { });
  }

  export async function loadTerrain(window: Electron.WebContents, terrainFilePath: string, mapFilePath: string) {
    console.log('loadTerrain');

    terrainFilePath = path.join(path.parse(mapFilePath).dir, terrainFilePath);

    fs.readFile(terrainFilePath, 'utf8', (err: Error, data: string) => {
      if (err) {
        console.log(err);
      } else {
        window.send('terrain:loaded', data);
      }
    });
  }
}
