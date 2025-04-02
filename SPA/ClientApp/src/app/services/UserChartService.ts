// import { Inject, Injectable, InjectionToken } from '@angular/core';
// import { QueryChartModel } from 'src/models/QueryModel';
// import { ResultModel } from 'src/models/ResultModel';
// import { SensorValueBindingWithValuesModel } from 'src/models/SensorValueBindingWithValuesModel';
// import { UpdateChartBindingsModel } from 'src/models/UpdateChartBindingsModel';
// import { UserChartModel } from 'src/models/UserChartModel';
// import { UserModel } from 'src/models/UserModel';
// import { UserPasswordChangeModel } from 'src/models/UserPasswordChangeModel';
// import { ViewingBoreholeOnChartModel } from 'src/models/ViewingBoreholeOnChartModel';
// import { ApiService } from './ApiService';
// import { GenericEntityApiService } from './GenericEntityApiService';
// import * as moment from 'moment';
// import { ValuePackageModel } from 'src/models/ValuePackageModel';
// import { SensorValueModel } from 'src/models/SensorValueModel';
// import { UserTableModel } from 'src/models/UserTableModel';
// import { SensorOnUserChartModel } from 'src/models/SensorOnUserChartModel';
// import { SensorValueBindingModel } from 'src/models/SensorValueBindingModel';

// export const RANGE_MULTIPLIER: number = 2;
// export const SCROLL_THRESHOLD_PERCENT: number = 90;
// export const DYNAMIC_SCROLL_PAGE_COUNT: number = 2;
// export const DYNAMIC_SCROLL_SIZE_PERCENT: number = DYNAMIC_SCROLL_PAGE_COUNT / RANGE_MULTIPLIER * 100;
// export const GRAPGH_HEADER_HEIGHT: number = 86;
// export const STRETCH_ON_RT_PIXELS: number = 12;
// export const PAGE_HEIGHT: number = 700;
// export const TALBE_ROW_HEIGHT: number = 58;

// @Injectable({
//     providedIn: "root"
// })
// export class UserChartService {
//     public sensorCounters: {[bindingId:number] : number };

//     constructor(private apiService: ApiService) {

//     }
//     EntityApiPath: string = "userchart";

//     public async GetQuery(queryModel: QueryChartModel): Promise<UserChartModel[]> {
//         let result = await this.apiService.get<UserChartModel[]>(`${this.EntityApiPath}/query` + queryModel.BuildHttpParams());
//         for(const userchart of result){
//             userchart.activeSensorValueBindings = userchart.activeSensorValueBindings.sort((a, b) => a.orderNum - b.orderNum);

//             userchart.activeSensorValueBindings.forEach(sensorValueBinding => {
//                 sensorValueBinding.circularCounter = 0;
//                 sensorValueBinding.threshold = sensorValueBinding.sigmaThreshold * sensorValueBinding.stdDev;
                
//                 let conversionFactor: number = sensorValueBinding.valueType.conversionFactor;
//                 sensorValueBinding.threshold *= conversionFactor
//                 sensorValueBinding.average *= conversionFactor
//             })
//         }
//         return result;
//     }
//     public async GetQueryTable(queryModel: QueryChartModel): Promise<UserTableModel> {
//         let result = await this.apiService.get<UserTableModel>(`${this.EntityApiPath}/querytable` + queryModel.BuildHttpParams());
//         console.log(result);
//         return result;
//     }
//     public async DownloadExcel(queryModel: QueryChartModel){
//         await this.apiService.downloadGet<UserChartModel[]>(`${this.EntityApiPath}/download` + queryModel.BuildHttpParams(), queryModel.dateTime);
        
//     }
//     public async UpdateViewingBoreholes(models: ViewingBoreholeOnChartModel[]): Promise<ResultModel> {
//         let result = await this.apiService.put<ResultModel>(`${this.EntityApiPath}/boreholes`, models);
//         return result;
//     }

//     public async UpdateViewingBingings(model: UpdateChartBindingsModel): Promise<ResultModel> {
//         let result = await this.apiService.put<ResultModel>(`${this.EntityApiPath}/bindings`, model);
//         return result;
//     }
//     public async UpdateUserCharts(model: UserChartModel[]): Promise<ResultModel> {
//         let result = await this.apiService.put<ResultModel>(`${this.EntityApiPath}/usercharts`, model);
//         return result;
//     }

//     public async UpdateSensorOnUserChart(model: SensorOnUserChartModel): Promise<ResultModel> {
//         let result = await this.apiService.put<ResultModel>(`${this.EntityApiPath}/sensoronuserchart`, model);
//         return result;
//     }

//     public ProcessMessage(message: string, activeSensorValueBindings: SensorValueBindingWithValuesModel[]): ValuePackageModel[] {
//         let arr = message.split(';');
//         let datetime: any = moment(arr[0])
//             .format('YYYY-MM-DD HH:mm:ss.SSSZ');
//         let valuePackages: ValuePackageModel[] = [];

//         activeSensorValueBindings.forEach(binding => {
//             let value: any = arr[binding.orderNum + 1];
//             if (value == "null")
//                 return;
//             let valuePackage = {
//                 sensorValue: { id: 0, valueReal: value, dateTimeIso: datetime } as SensorValueModel,
//                 valueBindingId: binding.id

//             } as ValuePackageModel;

//             valuePackages.push(valuePackage);
//         });

//         return valuePackages;
//     }

//     public dataPrepare(userChart: UserChartModel) {
//         userChart.activeSensorValueBindings
//             .sort(x => x.orderNum)
//             .forEach((sensorValueBinding, index) => {
//                 sensorValueBinding.orderNum = index;
//             });
//     }
//     public DateIsoToTimezoneMoment(dateTimeIso: string, currentTimezone: number, shiftBackwards: boolean = false): moment.Moment {
//         let timeShift = (shiftBackwards)? currentTimezone * -1 : currentTimezone;

//         return moment.utc(dateTimeIso)
//             .add({ hours: timeShift })
//             .set("ms", 0);
//     }
//     public getRange(range: number) {
//         return range * RANGE_MULTIPLIER;
//     }
//     public getDynamicRange(range: number, timesScrolled: number, timesScrolledOffset: number = 0): number {
//         let rangeRes = this.getRange(range)
//             + Math.floor((timesScrolled + timesScrolledOffset)
//             * this.getRange(range)
//             * (DYNAMIC_SCROLL_SIZE_PERCENT / 100));
//         return rangeRes
//     }
//     public ConvertValueBinding(userChart: UserChartModel, sensorBinding: SensorValueBindingWithValuesModel, sensorValue: SensorValueModel){
//         let sensor = userChart.sensorOnUserChartModels.find(sensorValueBinding => sensorValueBinding.sensorValueBindingId == sensorBinding.id);

//         if(sensorBinding.valueType.conversionFactor != 0){
//             sensorValue.valueReal /= sensorBinding.valueType.conversionFactor;
//             sensorValue.valueReal *= sensor.valueType.conversionFactor;
//         }

//         this.RoundSensorValue(sensorValue, sensor.fractionalDigits);
//     }
//     public RoundSensorValue(sensorValue: SensorValueModel, fractionalDigits: number){
//         sensorValue.valueReal = Number(Number(sensorValue.valueReal).toFixed(fractionalDigits));
//     }
// }
