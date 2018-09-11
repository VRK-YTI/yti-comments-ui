import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalCommentsComponent } from './globalcomments.component';

describe('GlobalCommentsComponent', () => {
  let component: GlobalCommentsComponent;
  let fixture: ComponentFixture<GlobalCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
