import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentRoundsComponent } from './commentrounds.component';

describe('CommentRoundsComponent', () => {
  let component: CommentRoundsComponent;
  let fixture: ComponentFixture<CommentRoundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentRoundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentRoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
