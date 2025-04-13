import { SensorValueModel } from "./SensorValueModel";

export class SensorWithValuesModel {
    id!: number;
    positionIndex: number = 0;
    decimalPlaces: number = 3;
    measuringUnitName: string = 'unit not set';
    moduleId!: number;
    sensorValues: SensorValueModel[] = [];
}