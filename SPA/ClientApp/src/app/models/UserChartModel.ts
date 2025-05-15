import { SensorWithValuesModel } from "./SensorWithValuesModel";

export class UserChartModel {
    id!: number;
    name!: string;
    description: string | null = null;
    mqttTopic!: string;
    createdAt: string = '';
    sensors: SensorWithValuesModel[] = [];
}