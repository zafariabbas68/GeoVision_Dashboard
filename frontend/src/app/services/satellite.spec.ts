import { TestBed } from '@angular/core/testing';

import { Satellite } from './satellite';

describe('Satellite', () => {
  let service: Satellite;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Satellite);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
