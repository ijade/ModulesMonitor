import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseIdModel } from 'src/app/models/BaseIdModel';
import { IdNameModel } from 'src/app/models/IdNameModel';
import { SensorModel } from 'src/app/models/SensorModel';
import { NotificationService } from 'src/app/services/NotificationService';
// import { SensorService } from 'src/services/SensorService';

@Component({
  selector: 'app-sensor-value-binding',
  templateUrl: './sensor-value-binding.component.html',
  styleUrls: ['./sensor-value-binding.component.scss']
})
export class SensorValueBindingComponent implements OnInit {
  form: FormGroup = this.buildEmptyForm();
  // valueTypes: SensorValueTypeModel[] = [];
  @Input() model!: SensorModel
  // @Input() sensorparameters: SensorParameterModel[];
  @Input() isEditingBorehole!: boolean;

  @Input() SaveByParent!: EventEmitter<void>;
  @Output() onDelete: EventEmitter<number> = new EventEmitter();
  @Output() onSave: EventEmitter<void> = new EventEmitter();

  idNameModelToString = IdNameModel.ToString;
  toString = SensorModel.ToString;

  optionCompareMethod = BaseIdModel.Compare;
  isEditing: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private notify: NotificationService,
    // private sensorParameterService: SensorService
  ) { }

  ngOnInit(): void {
    // this.sensorParameterService.GetValueTypes().then(values => {
    //   values.sort((a, b) => a.parameterGroup - b.parameterGroup);

    //   this.valueTypes = values;
    // });

    if (this.model.isNew === true) {
      this.isEditing = true
    }

    console.log(this.model);

    if (!this.model.isNew){
      this.form = this.formBuilder.group(
        {
          decimalPlaces: [this.model.decimalPlaces, Validators.required],
          measuringUnitName: this.model.measuringUnitName,
        });
    }

    console.log(this.model);

    this.SaveByParent.subscribe(() => this.validate());
  }

  private buildEmptyForm(): FormGroup{
    return this.formBuilder.group(
      {
        decimalPlaces: 0,
          // , Validators.required, Validators.min(0)],
        measuringUnitName: '',
      });
  }

  edit() {
    this.isEditing = true;
  }

  validate() {
    console.log('validae sensor called');

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.model.decimalPlaces = this.form.value.decimalPlaces;
    this.model.measuringUnitName = this.form.value.measuringUnitName;
    this.model.isNew = false;
    this.isEditing = false;
  }

  save() {
    if (this.form.valid)
      this.onSave.emit();
  }

  delete(orderNum: number): void {
    this.onDelete.emit(orderNum);
  }

}
