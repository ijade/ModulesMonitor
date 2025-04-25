import { Component, OnInit, OnDestroy, ElementRef, EventEmitter, Input, Output, ViewChild, Inject } from "@angular/core";
import { ChartOptions, ChartDataset, ChartType } from "chart.js";
import * as moment from "moment";
import 'chartjs-adapter-moment';
import { BaseChartDirective } from "ng2-charts";
import { Subscription } from "rxjs";
import { TimeFormat } from "src/app/common/ToStringFunctions";
import { SensorModel } from "src/app/models/SensorModel";
import { UserChartModel } from "src/app/models/UserChartModel";
import { SensorWithValuesModel } from "src/app/models/SensorWithValuesModel";
import { NgxMatDateAdapter } from "@angular-material-components/datetime-picker";
import { MatDialog } from "@angular/material/dialog";
import { UserChartService } from "src/app/services/UserChartService";

enum AppendType {
    Realtime = "Realtime",
    History = "History"
}

//native js globals
var countCharts;
var countChartsPrevious;

export const REALTIME_GRAPH_SHIFT_MINUTES: number = 3;
const MARK_INTERVAL_COEFFICIENT = 5;
const LEGEND_CONTAINER_ID = "legend-container";
const DEFAULT_CHART_EVENTS: string[] = ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'];

@Component({
    selector: 'app-graph',
    templateUrl: './graph.component.html',
    // styleUrls: ['./graph.component.scss']
  })
  export class GraphComponent implements OnInit, OnDestroy {
    isPendingChartRender: boolean = false;
    isPendingChartUpdate: boolean = false;
  
    @Input() width: string = '';
    @Input() userChart!: UserChartModel;
    @Input() dateAxisIsShowing: boolean = false;
    @Input() dateTime: any;
  
    _range: number = 5;
    get range(): number {
      return this._range;
    }
    @Input() set range(value: number) {
      this._range = value;
  
    //   this.markIntervalMinutes = Math.ceil(this.range / MARK_INTERVAL_COEFFICIENT);
    //   this.lineChartOptions.scales.y.ticks.stepSize = this.markIntervalMinutes;
    }
    @Input() timesScrolled: number = 0;
    @Input() currentTimezone: number = 0;
    @Input() isOnline: boolean = false;
    @Input() last: boolean = false;
    @Input() graphHeight: string = '';
  
    _index: number = 0;
    get index(): number {
      return this._index;
    }
    @Input() set index(value: number) {
      this._index = value;
  
      this.lineChartOptions.id = this.index;
    }
  
    @Input()
    countGraphs!: number;
    @Input()
    isScrollLocked!: boolean;
    @Input() onOnline: EventEmitter<void> = new EventEmitter();
    @Input() onOffline: EventEmitter<void> = new EventEmitter();
    @Input() onUpdatedValues: EventEmitter<UserChartModel> = new EventEmitter();
    @Input() onUpdatedDislpayValues: EventEmitter<any> = new EventEmitter();
  
    @Output() onEditBindings: EventEmitter<UserChartModel> = new EventEmitter();
    @Output() onGraphDrawn: EventEmitter<boolean> = new EventEmitter();
    @Output() onGraphStretch: EventEmitter<moment.Moment> = new EventEmitter();
    @Output() onDownloadExcel: EventEmitter<UserChartModel> = new EventEmitter();
  
    @ViewChild('canvas')
    canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective | any;
  
    labelColorCallback = (context: any) => {
      return {
        backgroundColor: context.dataset.color
      };
    }
  
    // filterTimeMarks = (value, index) => {
    //   let momentTimeMark = moment(value)
    //     .seconds(0).milliseconds(0);
  
    //   let diff;
    //   if (!this.previousLeadingTimeMark) {
    //     this.previousLeadingTimeMark = momentTimeMark;
    //     this.leadingTimeMark = moment(momentTimeMark);
  
    //   }
    //   else if (index === 0 && momentTimeMark.diff(this.previousLeadingTimeMark, "minutes") != 0) {
  
    //     this.leadingTimeMark = moment(momentTimeMark);
    //     this.previousLeadingTimeMark = moment(momentTimeMark);
    //     this.onGraphStretch.emit(momentTimeMark);
  
    //     this.DrawYAxis(this.UpdateGraphRange());
    //   }
  
    //   return momentTimeMark.format(TimeFormat);
    // };
  
    lineChartOptions: ChartOptions | any = {
      interaction: {
        intersect: false,
        axis: 'y',
        mode: 'nearest',
      },
  
      indexAxis: 'y',
      scales: {
        y: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          reverse: true,
          type: 'time',
          time: {
            parser: 'YYYY-MM-DD HH:mm:ss.fffzzz',
            tooltipFormat: "DD.MM.YYYY HH:mm:ss",
            unit: 'minute',
            displayFormats: {
              hour: "DD.MM.YYYY HH:00",
              minute: TimeFormat,
              second: "DD.MM.YYYY HH:mm:ss"
            },
          },
          ticks: {
            padding: 0,
            stepSize: 10,
            // callback: this.filterTimeMarks
          },
          padding: 0
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            labelColor: this.labelColorCallback
          },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        },
        colors: {
          forceOverride: true
        },
        legend: {
          position: 'bottom',
          display: false,
          align: 'start',
          title: {
            padding: 20,
          }
        },
        htmlLegend: {
          containerID: LEGEND_CONTAINER_ID,
        },
        annotation: {
          annotations: []
        }
      },
      events: DEFAULT_CHART_EVENTS,
      maintainAspectRatio: false,
      spanGaps: true,
      animation: false,
      borderWidth: 2,
      datasets: {
        line: {
          pointRadius: 0
        }
      },
      elements: {
        point: {
          radius: 0
        }
      }
    };
  
    allBindings: SensorModel[] = [];
    chartDataSet: ChartDataset[] | any[] = [];
    lineChartType: ChartType = "line";
    mqttSubscribe!: Subscription;
    onOnlineSubscribe!: Subscription;
    onOfflineSubscribe!: Subscription;
    onUpdatedValuesSubscribe!: Subscription;
    onUpdatedDislpayValuesSubscribe!: Subscription;

    constructor(@Inject('BASE_URL') baseUrl: string,
        private userChartService: UserChartService,
        private dialog: MatDialog,
        private adapter: NgxMatDateAdapter<moment.Moment>
      ) {
      }

    ngOnInit(): void {
      this.lineChartOptions.scales['y'].display = this.dateAxisIsShowing;

      let firstBinding = true;
      this.userChart.sensors.forEach((sensor) => {
        let orderNum = sensor.positionIndex
  
        this.chartDataSet[orderNum] = { data: [] };
  
        let chartSet = this.chartDataSet[orderNum];
        const spaces = '';
        chartSet.displayValue = "";
        chartSet.valueTypeName = sensor.measuringUnitName;
        chartSet.shortName = sensor.measuringUnitName;
        chartSet.outputType = "chart";
        let displayValues = chartSet.outputType === 'chart'
        chartSet.hidden = !displayValues;
        chartSet.isReverse = false;//sensorOnUserChart.isReverse;
        // chartSet.color = sensorOnUserChart.color;
        // chartSet.borderColor = sensorOnUserChart.color;
        // if (sensorOnUserChart.isReverse) {
        //   chartSet.min = sensorOnUserChart.max;
        //   chartSet.max = sensorOnUserChart.min;
        // }
        // else {
        //   chartSet.min = sensorOnUserChart.min;
        //   chartSet.max = sensorOnUserChart.max;
        // }
  
        chartSet.label = chartSet.valueTypeName
  
        let xAxisName = "x" + orderNum;
        this.lineChartOptions.scales[xAxisName] = {
          reverse: chartSet.isReverse,
          display: false,
        };
        chartSet.xAxisID = xAxisName;
  
        if (firstBinding) {
          firstBinding = false;
  
          let stepCount = 10;
          // let valuesRange = Math.abs(sensorOnUserChart.min) + Math.abs(sensorOnUserChart.max);
        //   let stepSize = valuesRange / 10;
  
        //   for (let i = 0; i <= stepCount; i++) {
        //     let value = sensorOnUserChart.min + stepSize * i;
        //     let borderColor = 'rgb(200, 200, 200)';
        //     let borderWidth = 1;
        //     if (i == 0 || i == stepCount) {
        //       borderColor = 'rgb(100, 100, 100)';
        //       borderWidth = 2;
        //     }
  
        //     let annotation = {
        //       type: 'line',
        //       mode: 'vertical',
        //       scaleID: xAxisName,
        //       value: value,
        //       borderColor: borderColor,
        //       borderWidth: borderWidth,
        //     }
        //     this.lineChartOptions.plugins.annotation.annotations.push(annotation);
        //   }
        }
  
        this.appendValues(sensor);
      });
    }
    ngOnDestroy(): void {
        
    }

    private appendValues(bindingWithNewData: SensorWithValuesModel, appendType: AppendType = AppendType.History) {
      let chartSet = this.chartDataSet[bindingWithNewData.positionIndex];
  
      let sensorValuesSegment = bindingWithNewData.sensorValues.map(valueModel => {
        return {
          x: valueModel.value,
          y: this.userChartService.DateIsoToTimezoneMoment(valueModel.readingDateTime, this.currentTimezone).toISOString()
        }
      });

      let fullUserChart: UserChartModel = this.userChart;
      let binding = fullUserChart.sensors.find(x => x.id === bindingWithNewData.id);

      if (!binding) return;

      switch (appendType) {
        case AppendType.History:
          chartSet.data.push(...sensorValuesSegment);
          binding.sensorValues.push(...bindingWithNewData.sensorValues);
          break;

        case AppendType.Realtime:
          chartSet.data.unshift(...sensorValuesSegment)
          binding.sensorValues.unshift(...bindingWithNewData.sensorValues);
      }
    }

    editBindings() {
      throw new Error('Method not implemented.');
    }
    editParameter(arg0: number,arg1: number) {
      throw new Error('Method not implemented.');
    }
  }