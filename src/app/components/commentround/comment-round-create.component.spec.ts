import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentRoundCreateComponent } from './comment-round-create.component';

describe('CommentCreateComponent', () => {
  let component: CommentRoundCreateComponent;
  let fixture: ComponentFixture<CommentRoundCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentRoundCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentRoundCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
