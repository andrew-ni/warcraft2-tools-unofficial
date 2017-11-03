import { inject, TestBed } from '@angular/core/testing';

import { CanvasService } from './canvas.service';

describe('CanvasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanvasService]
    });
  });

  it('should be created', inject([CanvasService], (service: CanvasService) => {
    expect(service).toBeTruthy();
  }));
});
