import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentRoundComponent } from './commentround.component';

describe('CommentRoundComponent', () => {
  let component: CommentRoundComponent;
  let fixture: ComponentFixture<CommentRoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentRoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
