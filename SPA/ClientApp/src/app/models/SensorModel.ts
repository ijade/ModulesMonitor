import { ModuleModel } from "./ModuleModel";

export class SensorModel {
id!: number;
positionIndex!: number;
decimalPlaces!: number;
measuringUnitName!: string;
module: ModuleModel | null = null;

isNew: boolean = false;

    public static ToString(model: SensorModel): string {
        if (model === undefined || model.measuringUnitName === undefined)
            return '';
        return `${model.measuringUnitName} #${model.positionIndex}`
    }
}