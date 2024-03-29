import { Injectable } from '@angular/core';
import { readFile } from 'fs';
import { join as pathJoin } from 'path';
import { Subject } from 'rxjs/Rx';

import { AssetType, neutralAssets } from 'asset';
import { Coordinate } from 'interfaces';
import { FileService } from 'services/file.service';
import { MapService } from 'services/map.service';
import { AnimationAction, AnimationDirection, Sprite } from 'sprite';
import { Tileset } from 'tileset';


interface IMap {
  tileSet: Tileset;
  mapLoaded: Subject<void>;
}

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
  private sprites = new Map<AssetType, Sprite>();

  private map: IMap;

  constructor(
    private fileService: FileService,
    mapService: MapService,
  ) {
    this.map = mapService;
    this.preInit();

    mapService.mapProjectOpened.subscribe(async zip => {
      fileService.init(zip);
      await this.init();
      mapService.mapProjectLoaded.next(undefined);
     });
  }

  public preInit() {

    for (let type = 0; type < AssetType.MAX; type++) {
      this.sprites.set(type, new Sprite(undefined, undefined, undefined, undefined, false));
    }
  }

  /**
   * Initializes the service.
   * Since the initialization needs to be asynchronous, it must be in
   * its own function so it can be awaited.
   * Needs to be called before `get`
   */
  public async init() {
    const prefetches: Promise<void>[] = [];
    for (let type = 0; type < AssetType.MAX; type++) {
      prefetches.push(this.prefetch(type));
    }

    /** Initialize the colorMap with Colors.png */
    this.colorMap = await this.HTMLImageToImageData(await this.loadImage('data/img/Colors.png'));

    return Promise.all(prefetches);

    
  }

  /**
 * Returns an array of all sprites that are not default. Intended
 * to be used for packaging purposes.
 */
  public getModifiedImages() {

    const getBlob = (image: ImageBitmap, type: AssetType) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = neutralAssets.has(type) ? image.width : image.width / MapService.MAX_PLAYERS;
      canvas.height = image.height;

      context.drawImage(image, 0, 0);

      return new Promise<Blob>(resolve => {
        canvas.toBlob(blob => resolve(blob));
      });
    };

    const ret = new Array<{ type: AssetType, blob: Promise<Blob> }>();

    this.sprites.forEach((sprite, key) => {
      if (sprite.isCustom) ret.push({ type: key, blob: getBlob(sprite.image, key) });
    });

    return ret;
  }

  /**
   * Fetches the sprite for the given asset type.
   * If `isColored` is true for the given type, the sprite will be recolored for each team.
   * If the sprite has not been loaded before it will be loaded from the filesystem.
   * @param type The asset type of the sprite
   */
  private async prefetch(type: AssetType) {
    const { fileData, image, isCustom } = await this.fileService.getImg(type);
    const { defaultIndex, imagePath, animationSets } = this.parseDataFile(fileData);
    const bitmap = neutralAssets.has(type) ? image : await this.recolorBitmap(image);
    Object.assign(this.sprites.get(type), new Sprite(bitmap, imagePath, defaultIndex, animationSets, isCustom));
    if (type === AssetType.Terrain) { this.map.tileSet = new Tileset(fileData); this.map.mapLoaded.next(); }
  }

  /**
   * Recreates the ImageBitmap for a given Sprite. AssetType is needed to determine if recoloring is needed.
   * @param type The asset type of the sprite
   */
  public async reset(type: AssetType) {
    const sprite = this.sprites.get(type);
    const { image } = await this.fileService.getImg(type, true);  // true to force default png
    sprite.image = await (neutralAssets.has(type) ? image : this.recolorBitmap(image));
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
  public async loadImage(path: string) {
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
  public HTMLImageToBitmap(image: HTMLImageElement) {
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
   * Given a bitmap it will resize the image to width * MaxPlayers,
   * And recolor each bitmap for each player.
   * The recoloring is based of colorMap.
   * @param bitmap The bitmap to recolor for each player.
   */
  private async recolorBitmap(bitmap: ImageBitmap) {
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

    canvas.width = bitmap.width * this.colorMap.height;
    canvas.height = bitmap.height;

    for (let player = 0; player < this.colorMap.height; player++) {
      context.drawImage(bitmap, player * bitmap.width, 0);
    }

    const image = context.getImageData(0, 0, bitmap.width * this.colorMap.height, bitmap.height);
    recolor(image, bitmap.width);
    return createImageBitmap(image);
  }



  /**
   * Reads the .dat files for the desired asset.
   * Parses the image path, the default index, and all of the animation information.
   * @param fileData AssetType to parse (e.g. 'Peasant')
   * @returns The image path, animation data, and default index for the asset type.
   */
  private parseDataFile(fileData: string) {
    /**
     * Parses the relative image path and the frame names for the animations
     * @param fileData The raw .dat file contents.
     * @returns The relative path and an array of frame names.
     */
    const parseFileSections = (data: string) => {
      const [, relativePath, , frameNames] = data.split(/#.*?\r?\n/);

      return {
        relativePath: relativePath.trim(),
        frameNames: frameNames.trim().split(/\r?\n/),
      };
    };

    /**
     * Parses the frames and maps the animation name to the data about the frames in the animation.
     * Map: animationName => {subType, subIndex, index}[]
     *
     * For example if a frameName is 'lumber-nw-3',
     * this becomes:
     * animationName: 'lumber',
     * subType: 'nw',
     * subIndex: 3
     *
     * Which is then mapped 'lumber' => {'nw', 3, index}
     *
     * @param frameNames Array of frame names from a .dat file
     */
    const parseFrames = (frameNames: string[]) => {
      const rawAnimationSets = new Map<string, FrameData[]>();
      let defaultIndex: number;

      for (const [index, framName] of frameNames.entries()) {
        // Ex. `lumber-nw-3`
        // Group 1. `lumber`      animationName
        // Group 3. `nw`          subType
        // Group 5. `3`           subIndex
        const [, animationName, , subType, , subIndexStr] = framName.match(/\b([a-z]+)(-([a-z]+))?(-(\d+))?\b/);
        const subIndex = (subIndexStr === undefined) ? 0 : parseInt(subIndexStr, 10);

        if (animationName === 'inactive') defaultIndex = index;
        if (!rawAnimationSets.has(animationName)) rawAnimationSets.set(animationName, []);

        rawAnimationSets.get(animationName).push({ subType, subIndex, index });
      }

      return { rawAnimationSets, defaultIndex };
    };

    /**
     * Iterates through the `rawAnimationSets` and builds the individual `AnimationsSets`
     *
     * The animationSets are mapped by both a numeric index [0,numberAnimationSets)
     * and by the animationName.
     *
     * Eg. animationSets[0] or animationSets['<animationName>']
     *
     * @param rawAnimationSets The lists of raw animationSets to build from.
     * @returns An array of `AnimationSets` mapped by both index and `animationName`
     */
    const buildAnimationSets = (rawAnimationSets: Map<string, FrameData[]>) => {

      /**
       * Iterates through the `rawAnimations` and builds the individual `Animations`
       *
       * The animationSets are mapped by both a numeric index [0,numberAnimations)
       * and by the subType.
       *
       * Eg. animations[0] or animations['<subType>']
       *
       * @param framaData The list of frameData to build from.
       * @returns An array of `Animations` mapped by both index and `subType`
       */
      const buildAnimations = (framaData: FrameData[]) => {
        const rawAnimations = new Map<string, number[]>();
        const animations: AnimationDirection[] = [];

        // Populate the rawAnimations.
        for (const frame of framaData) {
          if (!rawAnimations.has(frame.subType)) rawAnimations.set(frame.subType, []);

          const indices = rawAnimations.get(frame.subType);
          indices.length = Math.max(frame.subIndex + 1, indices.length);
          indices[frame.subIndex] = frame.index;
        }

        // Construct the Animation objects from the raw data.
        for (const [subType, indices] of rawAnimations) {
          const anim = new AnimationDirection(subType, indices);
          animations.push(anim);
          animations[subType] = anim; // Also map by the subType.
        }

        return animations;
      };

      const animationSets: AnimationAction[] = [];

      for (const [animationName, frameData] of rawAnimationSets) {
        const anim = new AnimationAction(animationName, buildAnimations(frameData));
        animationSets.push(anim);
        animationSets[animationName] = anim; // Also map by the animationName.
      }

      return animationSets;
    };

    {
      const parsedData = { animationSets: [] } as ParsedData;

      // Extract the image path and raw frame data.
      const { relativePath, frameNames } = parseFileSections(fileData);
      parsedData.imagePath = pathJoin('data/img/', relativePath);

      // Parse the frame data and build the animations.
      const { rawAnimationSets, defaultIndex } = parseFrames(frameNames);
      parsedData.defaultIndex = (defaultIndex === undefined) ? 0 : defaultIndex;
      parsedData.animationSets = buildAnimationSets(rawAnimationSets);

      return parsedData;
    }
  }
}

/**
 * Represents all the information extracted from an image asset .dat file.
 */
interface ParsedData {
  defaultIndex: number;
  imagePath: string;
  animationSets: AnimationAction[];
}

/**
 * Represents a single raw frame of an AnimationSet. Eg. 'lumber-nw-3'
 */
interface FrameData {
  /** Eg. 'lumber-nw-3' => 'nw' */
  subType: string;
  /** Eg. 'lumber-nw-3' => 3 */
  subIndex: number;
  /** The index within the spritesheet. Eg. 0 is first image and so on. */
  index: number;
}
