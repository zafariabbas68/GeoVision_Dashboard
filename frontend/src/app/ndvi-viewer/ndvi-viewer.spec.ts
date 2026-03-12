import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdviViewer } from './ndvi-viewer';

describe('NdviViewer', () => {
  let component: NdviViewer;
  let fixture: ComponentFixture<NdviViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdviViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdviViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
