import { BaseIdModel } from "./BaseIdModel";

export class IdNameModel extends BaseIdModel {
  public name!: string;
  public nameEn!: string;

  public static ToString(model: IdNameModel, lang: String = "ru"): string {
    switch(lang){
      case "ru":
        if (model?.name != undefined) return model.name;
        break;
      case "en":
        if (model?.nameEn != undefined) return model.nameEn;
        break;
    }
    return '';
  }
  public static ToStringArray(arr: IdNameModel[]): string {
    if (arr?.length == 0)
      return '';

    return arr?.map(u => IdNameModel.ToString(u)).join(", ");
  }
}
