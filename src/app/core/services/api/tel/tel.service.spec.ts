import { TestBed } from '@angular/core/testing';

import { TelService } from './tel.service';

describe('TelService', () => {
  let service: TelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
