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
    console.log('loadMap ' + filename);

    window.send('map:loaded', filename);
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
}
