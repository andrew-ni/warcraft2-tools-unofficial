import * as fs from 'fs';
import * as path from 'path';

/**
 * Module is like a namespace so we don't pollute the global space
 */
export module IO {
  /**
   * Loads the map contents into `data`, then sends a 'map:loaded' signal to the window
   * Async function, because loading the map could take some time
   * @param window The Electron window
   * @param filename string of which .map file we want to open
   */
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

  /**
   * TODO: make main thread stateless; have mapservice decide whether a save is valid; handle errors
   */

  /**
   * Renderer allows us to save
   * @param data The stringify data that we want to save to the specified filepath string
   * @param filepath Where we want to save data
   */
  export async function saveMap(data: string, filepath: string) {
    console.log('saveMap');
    fs.writeFile(filepath, data, () => { });
  }

  /**
   * Loads terrain.dat for canvasService to use when drawing map
   * Default: Terrain.dat
   * @param window
   * @param terrainFilePath Specifies terrain.dat to load
   * @param mapFilePath Specifies filepath of current map
   */
  export async function loadTerrain(window: Electron.WebContents, terrainFilePath: string, mapFilePath: string) {
    console.log('loadTerrain');

    const readTerrainFile = (filepath: string, onError: (Error) => void) => {
      fs.readFile(filepath, 'utf8', (err: Error, data: string) => {
        if (err) {
          onError(err);
        } else {
          window.send('terrain:loaded', data);
        }
      });
    };

    terrainFilePath = path.join(path.parse(mapFilePath).dir, terrainFilePath);

    readTerrainFile(terrainFilePath, (err) => {
      console.warn('Could not find ', terrainFilePath, '- Loading default TileSet');
      readTerrainFile('./src/assets/img/Terrain.dat', (err2) => console.error(err2));
    });
  }
}
