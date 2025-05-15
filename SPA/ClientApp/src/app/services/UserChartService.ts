import { Inject, Injectable, InjectionToken } from '@angular/core';
import { QueryChartModel } from '../models/QueryModel';
import { ResultModel } from '../models/ResultModel';
import { UserChartModel } from '../models/UserChartModel';
import { UserModel } from '../models/UserModel';
import { UserPasswordChangeModel } from '../models/UserPasswordChangeModel';
import { ApiService } from './ApiService';
import { GenericEntityApiService } from './GenericEntityApiService';
import * as moment from 'moment';
import { SensorValueModel } from '../models/SensorValueModel';

export const RANGE_MULTIPLIER: number = 2;
export const SCROLL_THRESHOLD_PERCENT: number = 90;
export const DYNAMIC_SCROLL_PAGE_COUNT: number = 2;
export const DYNAMIC_SCROLL_SIZE_PERCENT: number = DYNAMIC_SCROLL_PAGE_COUNT / RANGE_MULTIPLIER * 100;
export const GRAPGH_HEADER_HEIGHT: number = 86;
export const STRETCH_ON_RT_PIXELS: number = 12;
export const PAGE_HEIGHT: number = 700;
export const TALBE_ROW_HEIGHT: number = 58;

@Injectable({
    providedIn: "root"
})
export class UserChartService {
    public sensorCounters!: {[bindingId:number] : number };

    constructor(private apiService: ApiService) {

    }
    EntityApiPath: string = "userchart";

    public async GetQuery(queryModel: QueryChartModel): Promise<UserChartModel[]> {
        let result = await this.apiService.get<UserChartModel[]>(`${this.EntityApiPath}/query` + queryModel.BuildHttpParams());
        for(const userchart of result){
            userchart.sensors = userchart.sensors.sort((a, b) => a.positionIndex - b.positionIndex);

            // userchart.sensors.forEach(sensor => {
            //     sensor.circularCounter = 0;
            //     sensor.threshold = sensor.sigmaThreshold * sensor.stdDev;
                
            //     let conversionFactor: number = sensor.valueType.conversionFactor;
            //     sensor.threshold *= conversionFactor
            //     sensor.average *= conversionFactor
            // })
        }
        return result;
    }
        
    public async UpdateUserCharts(model: UserChartModel[]): Promise<ResultModel> {
        let result = await this.apiService.put<ResultModel>(`${this.EntityApiPath}/usercharts`, model);
        return result;
    }

    // public ProcessMessage(message: string, activeSensorValueBindings: SensorValueBindingWithValuesModel[]): ValuePackageModel[] {
    //     let arr = message.split(';');
    //     let datetime: any = moment(arr[0])
    //         .format('YYYY-MM-DD HH:mm:ss.SSSZ');
    //     let valuePackages: ValuePackageModel[] = [];

    //     activeSensorValueBindings.forEach(binding => {
    //         let value: any = arr[binding.orderNum + 1];
    //         if (value == "null")
    //             return;
    //         let valuePackage = {
    //             sensorValue: { id: 0, valueReal: value, dateTimeIso: datetime } as SensorValueModel,
    //             valueBindingId: binding.id

    //         } as ValuePackageModel;

    //         valuePackages.push(valuePackage);
    //     });

    //     return valuePackages;
    // }

    public dataPrepare(userChart: UserChartModel) {
        userChart.sensors
            .sort(x => x.positionIndex)
            .forEach((sensor, index) => {
                sensor.positionIndex = index;
            });
    }
    public DateIsoToTimezoneMoment(dateTimeIso: string, currentTimezone: number, shiftBackwards: boolean = false): moment.Moment {
        let timeShift = (shiftBackwards)? currentTimezone * -1 : currentTimezone;

        return moment.utc(dateTimeIso)
            .add({ hours: timeShift })
            .set("ms", 0);
    }
    public getRange(range: number) {
        return range * RANGE_MULTIPLIER;
    }
    public getDynamicRange(range: number, timesScrolled: number, timesScrolledOffset: number = 0): number {
        let rangeRes = this.getRange(range)
            + Math.floor((timesScrolled + timesScrolledOffset)
            * this.getRange(range)
            * (DYNAMIC_SCROLL_SIZE_PERCENT / 100));
        return rangeRes
    }
    // public ConvertValueBinding(userChart: UserChartModel, sensorBinding: SensorValueBindingWithValuesModel, sensorValue: SensorValueModel){
    //     let sensor = userChart.sensorOnUserChartModels.find(sensorValueBinding => sensorValueBinding.sensorValueBindingId == sensorBinding.id);

    //     if(sensorBinding.valueType.conversionFactor != 0){
    //         sensorValue.valueReal /= sensorBinding.valueType.conversionFactor;
    //         sensorValue.valueReal *= sensor.valueType.conversionFactor;
    //     }

    //     this.RoundSensorValue(sensorValue, sensor.fractionalDigits);
    // }
    // public RoundSensorValue(sensorValue: SensorValueModel, fractionalDigits: number){
    //     sensorValue.valueReal = Number(Number(sensorValue.valueReal).toFixed(fractionalDigits));
    // }
}
