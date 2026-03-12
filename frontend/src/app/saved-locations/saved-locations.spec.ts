import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedLocations } from './saved-locations';

describe('SavedLocations', () => {
  let component: SavedLocations;
  let fixture: ComponentFixture<SavedLocations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedLocations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedLocations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
