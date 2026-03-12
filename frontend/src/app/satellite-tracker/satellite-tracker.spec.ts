import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatelliteTracker } from './satellite-tracker';

describe('SatelliteTracker', () => {
  let component: SatelliteTracker;
  let fixture: ComponentFixture<SatelliteTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SatelliteTracker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SatelliteTracker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
