import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentThreadCreateComponent } from './comment-thread-create.component';

describe('CommentCreateComponent', () => {
  let component: CommentThreadCreateComponent;
  let fixture: ComponentFixture<CommentThreadCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentThreadCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentThreadCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
