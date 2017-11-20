import { Injectable } from '@angular/core';
import { parse } from 'path';

import { AssetType, neutralAssets } from 'asset';
import { ImgDat } from 'imgdat';
import { Coordinate } from 'interfaces';

/**
 * Handles all sprite loading and recoloring for assets
 */
@Injectable()
export class SpriteService {
  /**
   * If `init` has been called.
   * Currently the only thing being initialized is the color map.
   */
  private isInitialized = false;

  /** Colors.png used to recolor the sprites. */
  private colorMap: ImageData;

  /** Contains all the sprites assets loaded */
  private sprites = new Map<AssetType, ImgDat>();

  constructor() { }

  /**
   * Initializes the service.
   * Since the initialization needs to be asynchronous, it must be in
   * its own function so it can be awaited.
   * Needs to be called before `get`
   */
  public async init() {
    if (!this.isInitialized) {
      this.isInitialized = true;

      const prefetches: Promise<void>[] = [];
      for (let type = 0; type < AssetType.MAX; type++) {
        prefetches.push(this.prefetch(type));
      }

      /** Initialize the colorMap with Colors.png */
      this.colorMap = await this.HTMLImageToImageData(await this.loadImage('assets/img/Colors.png'));

      return Promise.all(prefetches);
    }
  }

  /**
   * Fetches the sprite for the given asset type.
   * If `isColored` is true for the given type, the sprite will be recolored for each team.
   * If the sprite has not been loaded before it will be loaded from the filesystem.
   * @param type The asset type of the sprite
   */
  private async prefetch(type: AssetType) {
    if (this.sprites.get(type) === undefined) {
      const myImgDat = new ImgDat();
      this.sprites.set(type, myImgDat);

      return new Promise<void>(async resolve => {
        await myImgDat.readDat(AssetType[type]);
        const img = await this.loadImage(myImgDat.path);

        if (neutralAssets.has(type)) {
          myImgDat.image = await this.HTMLImageToBitmap(img);
        } else {
          myImgDat.image = await this.recolorSprite(img);
        }
        resolve();
      });
    }
  }

  public async updatePNG(type: AssetType) {
    const myImgDat = new ImgDat();
    this.sprites.set(type, myImgDat);

    return new Promise<void>(async resolve => {
      await myImgDat.readDat(AssetType[type]);
      const img = await this.loadImage(myImgDat.path);
      resolve();
    });
  }

  /**
   * Returns the sprite object for the given asset type.
   * @param type The asset type of the sprite.
   * @throws If the asset sprite is not loaded.
   */
  public get(type: AssetType) {
    if (!this.sprites.has(type)) throw new Error('Asset image not loaded!');
    return this.sprites.get(type);
  }

  /**
   * Loads a png from the specified path.
   * @param path The path of the png file to load.
   * @returns An HTMLImageElement Promise that will resolve when the image is loaded from the filesystem.
   */
  private async loadImage(path: string) {
    const tempImage = new Image();
    const imageLoaded = new Promise<HTMLImageElement>((resolve) => {
      tempImage.onload = async () => {
        resolve(tempImage);
      };
    });
    tempImage.src = path;
    return imageLoaded;
  }

  /**
   * Converts HTMLImageElements to ImageBitmaps.
   * @param image The image to convert to bitmap format
   * @returns An ImageBitmap Promise that will resolve once the conversion is complete.
   */
  private HTMLImageToBitmap(image: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = image.width;
    canvas.height = image.height;

    context.drawImage(image, 0, 0);
    return createImageBitmap(context.getImageData(0, 0, image.width, image.height));
  }

  /**
   * Converts HTMLImageElements to ImageData.
   * ImageData allows for efficient access to the pixel data.
   * @param image The image to convert to ImageData format
   * @returns An ImageData Promise that will resolve once the conversion is complete.
   */
  private HTMLImageToImageData(htmlImage: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = htmlImage.width;
    canvas.height = htmlImage.height;

    context.drawImage(htmlImage, 0, 0);
    return context.getImageData(0, 0, htmlImage.width, htmlImage.height);
  }

  /**
   * Given a sprite it will resize the image to width * MaxPlayers,
   * And recolor each sprite for each player.
   * The recoloring is based of colorMap.
   * @param htmlImage The sprite to recolor for each player.
   */
  private async recolorSprite(htmlImage: HTMLImageElement) {
    const [r, g, b, a] = [0, 1, 2, 4];

    /** @returns A Uint8ClampedArray of length 4, where [R,G,B,A] are the elements. */
    const getPixel = (img: ImageData, pos: Coordinate) => {
      return new Uint8ClampedArray(img.data.buffer, pos.y * img.width * 4 + pos.x * 4, 4);
    };

    /** @returns True if the pixels are the same color.  */
    const testPixel = (px1: Uint8ClampedArray, px2: Uint8ClampedArray) => {
      return (px1[r] === px2[r] && px1[g] === px2[g] && px1[b] === px2[b]);
    };

    /**
     * Recolors the image in-place for each player.
     * @param img An image with duplicate of the original asset for each player.
     * @param w The width of the original asset
     */
    const recolor = (img: ImageData, w: number) => {
      for (let shade = 0; shade < this.colorMap.width; shade++) {
        const testPx = getPixel(this.colorMap, { x: shade, y: 0 });

        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < w; x++) {
            if (testPixel(testPx, getPixel(img, { x, y }))) {
              for (let player = 1; player < this.colorMap.height; player++) {
                const destPx = getPixel(img, { x: x + w * player, y });
                const srcPx = getPixel(this.colorMap, { x: shade, y: player });
                destPx[r] = srcPx[r]; destPx[g] = srcPx[g]; destPx[b] = srcPx[b];
              }
            }
          }
        }
      }
    };

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = htmlImage.width * this.colorMap.height;
    canvas.height = htmlImage.height;

    for (let player = 0; player < this.colorMap.height; player++) {
      context.drawImage(htmlImage, player * htmlImage.width, 0);
    }

    const image = context.getImageData(0, 0, htmlImage.width * this.colorMap.height, htmlImage.height);
    recolor(image, htmlImage.width);
    return createImageBitmap(image);
  }
}



