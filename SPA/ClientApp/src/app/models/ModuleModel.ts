import { Moment } from "moment";
import { SensorModel } from "./SensorModel";

export class ModuleModel {
id! : number;
name! : string;
description! : string;
mqttTopic! : string
createdAt!: Moment;
sensors: SensorModel[] = [];
}