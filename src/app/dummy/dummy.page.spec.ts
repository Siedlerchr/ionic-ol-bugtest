import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DummyPage } from './dummy.page';

describe('DummyPage', () => {
  let component: DummyPage;
  let fixture: ComponentFixture<DummyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DummyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DummyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
