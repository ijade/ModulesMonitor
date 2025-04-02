import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BaseIdModel } from 'src/app/models/BaseIdModel';
import { FormModalModel } from 'src/app/models/FormModalModel';
import { ModuleModel } from 'src/app/models/ModuleModel';
import { SensorModel } from 'src/app/models/SensorModel';
import { ModuleService } from 'src/app/services/ModuleService';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'module-modal-add-edit',
  templateUrl: './module-modal-add-edit.component.html',
})
export class ModuleModalAddEditComponent implements OnInit {
  isEditing: boolean = false;
  isLoading: boolean = false;
  buttonLabel: string = '';
  modalLabel: string = '';
  sensors: SensorModel[] = [];
  form: FormGroup = this.buildEmtpyForm();

  @Output() SaveSensor: EventEmitter<FormModalModel<ModuleModel>> = new EventEmitter();
  SaveByParent: EventEmitter<void> = new EventEmitter();

  optionCompareMethod = BaseIdModel.Compare;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ModuleModalAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FormModalModel<ModuleModel>,
    private moduleService: ModuleService) { }

  async ngOnInit(): Promise<void> {
    this.isEditing = this.data.isEditing;
    this.buttonLabel = !this.isEditing ? "Добавить" : "Сохранить";
    this.modalLabel = !this.isEditing ? "Добавить модуль" : "Редактирование модуля";

    if (this.isEditing) {
      this.moduleService.GetById(this.data.content.id).then(result => {
        this.data.content = result;

        this.fillForm();

        this.sensors = this.data.content.sensors.sort((a, b) => a.positionIndex - b.positionIndex);

        try {
          //get topic value
          // this.getHierarchy();
          // this.refreshDataTopicValue();
        }
        finally {
          this.isLoading = false;
        }
      });
    }
  }

  private buildEmtpyForm(): FormGroup{
    return this.formBuilder.group(
      {
        name: [''],
        description: [''],
        mqttTopic: ['', ],
        sensors: new FormArray([]),
      });
  }

  private fillForm() {
    this.form = this.formBuilder.group(
      {
        name: [this.data.content.name, [Validators.required, Validators.pattern("^[^/]*$")]],
        description: [this.data.content.description,[Validators.pattern("^[^/]*$")]],
        mqttTopic: [this.data.content.mqttTopic, Validators.required],
        sensors: this.formBuilder.array(this.sensors),
      });
  }

  private copyFromFormToModel() {
    this.data.content.name = this.form.value.name;
    this.data.content.description = this.form.value.description;
    this.data.content.mqttTopic = this.form.value.mqttTopic;
    this.data.content.sensors = this.sensors;

    console.log(this.form.value.sensors);
  }

  onSaveSensor() {
    this.saveAllBindings();
    if (!this.form.valid) {
      return;
    }

    this.copyFromFormToModel();

    this.SaveSensor.emit(this.data);
  }

  saveAllBindings() {
    this.SaveByParent.emit();
  }

  onSubmit() {
    if (!this.form.valid) {
        return;
    }

    this.copyFromFormToModel();

    this.dialogRef.close(this.data);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.sensors, event.previousIndex, event.currentIndex);
    moveItemInArray(this.form.value.sensors, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.form.value.sensors.length; i++) {
      this.form.value.sensors[i].orderNum = i;
    }
  }

  deleteSensorValueBinding(positionIndex: number): void {
    this.sensors = this.sensors.filter(x => x.positionIndex !== positionIndex);

    for (let i = 0; i < this.sensors.length; i++) {
      const sensorValueBinding = this.sensors[i];
      sensorValueBinding.positionIndex = i;
    }
  }
}
