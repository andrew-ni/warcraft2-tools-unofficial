import { TestBed, inject } from '@angular/core/testing';

import { IOService } from './io.service';

describe('IoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IOService]
    });
  });

  it('should be created', inject([IOService], (service: IOService) => {
    expect(service).toBeTruthy();
  }));
});
