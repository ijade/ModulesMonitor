import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTopicModalComponent } from './select-topic-modal.component';

describe('SelectTopicModalComponent', () => {
  let component: SelectTopicModalComponent;
  let fixture: ComponentFixture<SelectTopicModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectTopicModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectTopicModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
