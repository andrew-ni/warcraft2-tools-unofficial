import { Injectable } from '@angular/core';
import { readdir } from 'fs';
import { parse } from 'path';

import { AssetType } from 'asset';
import { Coordinate } from 'interfaces';


@Injectable()
export class SpriteService {
  private isInitialized = false;
  private colorMap: ImageData;
  private sprites = new Map<AssetType, ImageBitmap>();
  private isColored = new Map<AssetType, boolean>([
    [AssetType.Archer, true],
    [AssetType.Footman, true],
    [AssetType.Peasant, true],
    [AssetType.Ranger, true],
    [AssetType.Barracks, true],
    [AssetType.Blacksmith, true],
    [AssetType.Farm, true],
    [AssetType.CannonTower, true],
    [AssetType.Castle, true],
    [AssetType.GoldMine, false],
    [AssetType.GuardTower, true],
    [AssetType.Keep, true],
    [AssetType.LumberMill, true],
    [AssetType.ScoutTower, true],
    [AssetType.TownHall, true],
    [AssetType.Wall, true],
    [AssetType.Terrain, false],
    [AssetType.Colors, false],
  ]);

  constructor() {
  }

  public async init() {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.initColorMap(await this.loadImage('Colors'));
    }
  }

  public async get(type: AssetType) {
    if (this.sprites.get(type) === undefined) {
      const img = await this.loadImage(AssetType[type]);
      if (this.isColored.get(type)) {
        this.sprites.set(type, await this.recolorSprite(img));
      } else {
        this.sprites.set(type, await this.HTMLImageToBitmap(img));
      }
    }
    return this.sprites.get(type);
  }

  private async loadImage(name: string) {
    const tempImage = new Image();
    const imageLoaded = new Promise<HTMLImageElement>((resolve) => {
      tempImage.onload = async () => {
        resolve(tempImage);
      };
    });
    tempImage.src = 'assets/img/' + name + '.png';
    return imageLoaded;
  }

  private HTMLImageToBitmap(image: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = image.width;
    canvas.height = image.height;

    context.drawImage(image, 0, 0);
    return createImageBitmap(context.getImageData(0, 0, image.width, image.height));
  }

  private initColorMap(htmlImage: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = htmlImage.width;
    canvas.height = htmlImage.height;

    context.drawImage(htmlImage, 0, 0);
    this.colorMap = context.getImageData(0, 0, htmlImage.width, htmlImage.height);
  }

  private async recolorSprite(htmlImage: HTMLImageElement) {
    const [r, g, b, a] = [0, 1, 2, 4];

    const getPixel = (img: ImageData, pos: Coordinate) => {
      return new Uint8ClampedArray(img.data.buffer, pos.y * img.width * 4 + pos.x * 4, 4);
    };

    const testPixel = (px1: Uint8ClampedArray, px2: Uint8ClampedArray) => {
      return (px1[r] === px2[r] && px1[g] === px2[g] && px1[b] === px2[b]);
    };

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



