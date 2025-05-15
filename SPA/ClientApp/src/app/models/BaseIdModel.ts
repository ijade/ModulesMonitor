export class BaseIdModel {
    public id!: number;

    public static Compare(model1: BaseIdModel, model2: BaseIdModel): boolean {
        if (model1?.id === undefined || model2?.id === undefined)
            return false;
        return model1.id === model2.id && typeof (model1) === typeof (model2);
    }
}