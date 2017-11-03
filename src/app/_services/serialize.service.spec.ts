import { TestBed, inject } from '@angular/core/testing';

import { SerializeService } from './serialize.service';

describe('SerializeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SerializeService]
    });
  });

  it('should be created', inject([SerializeService], (service: SerializeService) => {
    expect(service).toBeTruthy();
  }));
});
