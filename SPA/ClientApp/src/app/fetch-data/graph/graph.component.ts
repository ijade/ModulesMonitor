import { Component, OnInit, OnDestroy, ElementRef, EventEmitter, Input, Output, ViewChild, Inject } from "@angular/core";
import { Chart, ChartDataset, ChartOptions, ChartType } from "chart.js";
import annotationPlugin from 'chartjs-plugin-annotation';
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
import { SensorValueModel } from "src/app/models/SensorValueModel";

enum AppendType {
    Realtime = "Realtime",
    History = "History"
}

//native js globals
var countCharts: number;
var countChartsPrevious: number;

export const REALTIME_GRAPH_SHIFT_MINUTES: number = 3;
const MARK_INTERVAL_COEFFICIENT = 5;
export const GRAPH_PAGE_HEIGHT_VH = 75;
const LEGEND_CONTAINER_ID = "legend-container";
const DEFAULT_CHART_EVENTS: string[] = ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'];
const GRAPH_COLORS = ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD'];
// ['#AEC7E8', '#FFBB78', '#98DF8A', '#FF9896', '#C5B0D5'];
// ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F'];


@Component({
    selector: 'app-graph',
    templateUrl: './graph.component.html',
    styleUrls: ['./graph.component.scss']
  })
  export class GraphComponent implements OnInit, OnDestroy {
    isPendingChartRender: boolean = false;
    isPendingChartUpdate: boolean = false;
    isLoading = true;
  
    @Input() width: string = '';
    @Input() userChart!: UserChartModel;
    @Input() dateAxisIsShowing: boolean = false;
    @Input() dateTime: any;
  
    _range: number = 8;
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
    @Input() onMessageReceived: EventEmitter<SensorValueModel[]> = new EventEmitter();
    @Input() onGraphRangeUpdated: EventEmitter<moment.Moment> = new EventEmitter();
  
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
      // responsive: true,
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
    onMessageReceivedSubscribe!: Subscription;
    onGraphRangeUpdatedSubscribe!: Subscription;
    dateTimeMin: moment.Moment = moment();

    constructor(@Inject('BASE_URL') baseUrl: string,
        private userChartService: UserChartService,
        private dialog: MatDialog,
        private adapter: NgxMatDateAdapter<moment.Moment>
      ) {
      }

    ngOnInit(): void {
      setInterval(() => {
        this.RenderChart();
      }, 1500);

      this.lineChartOptions.scales['y'].display = this.dateAxisIsShowing;

      let firstBinding = true;
      this.userChart.sensors.forEach((sensor) => {
        let min = Math.min.apply(Math, sensor.sensorValues.map(x => x.value));
        let max = Math.max.apply(Math, sensor.sensorValues.map(x => x.value));
        sensor.sensorValues.forEach(sensorValue => {
          let dateTimeCurrent = moment(sensorValue.readingDateTime);
          if(dateTimeCurrent.isBefore(this.dateTimeMin)) {
            this.dateTimeMin = dateTimeCurrent;
            // console.log(`set dateTimeMin to ${sensorValue.readingDateTime}`);
            // console.log(this.dateTimeMin);
          }
        });
        
        
        // console.log(`min ${min}, max ${max}`);
        let orderNum = sensor.positionIndex
        
        this.chartDataSet[orderNum] = { data: [] };
        this.appendValues(sensor.sensorValues);

        let chartSet = this.chartDataSet[orderNum];
        const spaces = '';
        chartSet.displayValue = "";
        chartSet.valueTypeName = sensor.measuringUnitName;
        chartSet.shortName = sensor.measuringUnitName;
        chartSet.outputType = "chart";
        let displayValues = chartSet.outputType === 'chart'
        chartSet.hidden = !displayValues;
        chartSet.isReverse = false;//sensorOnUserChart.isReverse;
        chartSet.min = min;
        chartSet.max = max;
        chartSet.color = GRAPH_COLORS[orderNum];
        chartSet.borderColor = GRAPH_COLORS[orderNum];
        console.log(this.chartDataSet[orderNum]);
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
          min: min,
          max: max,
        };
        chartSet.xAxisID = xAxisName;
  
        if (firstBinding) {
          firstBinding = false;
  
          let stepCount = 10;
          let valuesRange = Math.abs(chartSet.min) + Math.abs(chartSet.max);
          let stepSize = valuesRange / 10;
  
          for (let i = 0; i <= stepCount; i++) {
            let value = chartSet.min + stepSize * i;
            let borderColor = 'rgb(200, 200, 200)';
            let borderWidth = 1;
            if (i == 0 || i == stepCount) {
              value = (i == 0) ? chartSet.min : chartSet.max;
              borderColor = 'rgb(100, 100, 100)';
              borderWidth = 2;
            }
  
            let annotation = {
              type: 'line',
              mode: 'vertical',
              scaleID: xAxisName,
              value: value,
              borderColor: borderColor,
              borderWidth: borderWidth,
            }
            this.lineChartOptions.plugins.annotation.annotations.push(annotation);

            // console.log(this.lineChartOptions.plugins);
          }
        }
      });

      this.QueueRenderingFull();

      this.onMessageReceivedSubscribe = this.onMessageReceived.subscribe((sensorValues) =>{
        if( this.isLoading) return;
        // console.log(sensorValues);
        // console.log(this.userChart.sensors);

        sensorValues.forEach(sensorValue => {
          if (this.userChart.sensors.find(x => x.id == sensorValue.sensorId)) {
            this.appendValues([sensorValue]);

            // console.log(sensorValue);
          }
        });

        this.onGraphStretch.emit(moment());
        this.QueueRenderingFull();
      });

      this.onGraphRangeUpdatedSubscribe = this.onGraphRangeUpdated.subscribe((momentMin: moment.Moment) =>{
        this.UpdateGraphRange(momentMin);
        this.QueueRenderingFull();
      });

      countCharts = this.countGraphs;
      Chart.register(annotationPlugin, this.htmlLegendPlugin);

      this.isLoading = false;
    }
    ngOnDestroy(): void {
        
    }

    private appendValues(sensorValues: SensorValueModel[], appendType: AppendType = AppendType.History) {
      if (sensorValues.length === 0) return;

      let chartIndex = this.userChart.sensors.findIndex(x => x.id == sensorValues[0].sensorId);
      let chartSet = this.chartDataSet[chartIndex];
  
      let sensorValuesSegment = sensorValues.map(valueModel => {
        return {
          x: valueModel.value,
          y: this.userChartService.DateIsoToTimezoneMoment(valueModel.readingDateTime, this.currentTimezone).toISOString()
        }
      });

      let fullUserChart: UserChartModel = this.userChart;
      let binding = fullUserChart.sensors.find(x => x.id === sensorValues[0].sensorId);

      if (!binding) return;

      switch (appendType) {
        case AppendType.History:
          chartSet.data.push(...sensorValuesSegment);
          binding.sensorValues.push(...sensorValues);
          break;

        case AppendType.Realtime:
          chartSet.data.unshift(...sensorValuesSegment)
          binding.sensorValues.unshift(...sensorValues);
      }
    }

    editBindings() {
      throw new Error('Method not implemented.');
    }
    editParameter(arg0: number,arg1: number) {
      throw new Error('Method not implemented.');
    }

    private UpdateGraphRange(dateTimeMin: moment.Moment) {
      let momentNow: moment.Moment = moment();//(this.isOnline) ? moment() : moment(this.dateTime);
      momentNow.add({ hours: this.currentTimezone });
  
  
      let momentMin: moment.Moment = dateTimeMin;
      // moment(momentNow)
      //   .subtract({ minutes: this._userChartService.getDynamicRange(this.range, this.timesScrolled) });
  
      let momentMax: moment.Moment = momentNow;
      // if (this.isOnline) {
      //   momentMax = moment(momentNow)
      //     .add({ minutes: REALTIME_GRAPH_SHIFT_MINUTES });
      // }
      // else {
      //   momentMax = momentNow;
      // }
  
      // if (!this.isOnline || (REALTIME_GRAPH_SHIFT_MINUTES - moment(this.lineChartOptions.scales['y'].max).diff(momentNow, 'minutes') > 1)) {

        this.lineChartOptions.scales['y'].min = momentMin.toISOString();
        this.lineChartOptions.scales['y'].max = momentMax.toISOString();
      // }

      // console.log(`updated graph range, name: ${this.userChart.name}, yMin: ${momentMin.toISOString()}, yMax: ${momentMax.toISOString()}`)
  
      return {
        now: momentNow,
        min: momentMin,
        max: momentMax
      }
    }

    private RenderChart() {
      if (this.isPendingChartUpdate) {
        this.chart?.update();
  
        this.isPendingChartUpdate = false;
      }
  
      if (this.isPendingChartRender) {
        this.chart?.render();
  
        this.isPendingChartRender = false;
      }
    }
  
    private QueueRenderingFull() {
      this.isPendingChartRender = true;
      this.isPendingChartUpdate = true;
    }
  
    private QueueRenderingOnly() {
      this.isPendingChartRender = true;
    }

    private htmlLegendPlugin = {
      id: 'htmlLegend',
      afterUpdate(chart: any, args: any, options: any) {
        
        if (!countChartsPrevious) countChartsPrevious = countCharts;
        
        if (countCharts !== countChartsPrevious) {
          const legendContainer = document.getElementById(options.containerID);
          let listContainers = legendContainer?.querySelectorAll('ul');
          if (countCharts != listContainers?.length && legendContainer) {
            legendContainer.innerHTML = "";
          }
  
          countChartsPrevious = countCharts;
        }
        
        const ul = getOrCreateLegendList(chart, options.containerID, chart.config._config.options.id);
        
        if(ul){
          ul.innerHTML = "";
        }
        
        // Reuse the built-in legendItems generator
        const items = chart.options.plugins.legend.labels.generateLabels(chart);
        
        items.forEach((item:any) => {
          const dataItem = chart.config._config.data.datasets[item.datasetIndex]
          
          const li = document.createElement('li');
          li.style.alignItems = 'center';
          li.style.cursor = 'pointer';
          li.style.display = 'block';
          li.style.marginBottom = '10px';
          li.style.lineHeight = '16px';
          li.style.fontSize = '0.8rem';
  
          li.onclick = () => {
            const editButtonId = `btn-${chart.config._config.options.id}-${item.datasetIndex}`;
            document.getElementById(editButtonId)?.click();
          };
  
          // Text
          const textContainer = document.createElement('div');
          textContainer.style.color = dataItem.color;
          textContainer.style.display = 'flex';
          
          switch (dataItem.outputType) {
            case 'chart':
              textContainer.style.justifyContent = 'space-between';
  
              break;
              case 'left':
                textContainer.style.justifyContent = 'flex-start';
                
                break;
            case 'right':
              textContainer.style.justifyContent = 'flex-end';
            }
  
          textContainer.style.width = '100%';
          textContainer.style.margin = "0";
          textContainer.style.padding = "0";
  
          let infoNameContainer = document.createElement('div');
          infoNameContainer.innerHTML = `${dataItem.displayValue} ${dataItem.valueTypeName}`;
  
          let minValueContainer = document.createElement('div');
          let maxValueContainer = document.createElement('div');
  
            // if (dataItem.outputType === 'chart') {
            minValueContainer.innerHTML = dataItem.min;
            maxValueContainer.innerHTML = dataItem.max;
            // }
            
            // добавление текста над шкалой
            textContainer.appendChild(minValueContainer);
            textContainer.appendChild(infoNameContainer);
            textContainer.appendChild(maxValueContainer);
            
            li.appendChild(textContainer);
            
            // отображение шкалы
            // if (dataItem.outputType == "chart") {
              let scaleContainer = document.createElement('div');
              scaleContainer.style.display = "flex";
              scaleContainer.style.width = "calc(100% - 1px)";
              scaleContainer.style.height = "10px";
              scaleContainer.style.border = `1px solid ${dataItem.color}`;
              scaleContainer.style.borderTop = "none";
              
              for (let i = 0; i < 10; ++i) {
                let division = document.createElement('div');
                division.style.width = "10%";
                division.style.height = (i % 5 == 0) ? "100%" : "50%";
                division.style.marginTop = "auto";
                if (i !== 0)
                  division.style.borderLeft = `1px solid ${dataItem.color}`;
                scaleContainer.appendChild(division);
              }
              li.appendChild(scaleContainer);
              // }
              
              ul?.appendChild(li);
              // console.log(ul);
            });
      }
    };
  }

  const getOrCreateLegendList = (chart: any, id: any, index: any) => {
    let listContainer;
    const legendContainer = document.getElementById(id);

    
    let listContainers = legendContainer?.querySelectorAll('ul');
    
    const MINIMAL_CHART_WIDTH = 300;
    const availableWidth = window.innerWidth - TIME_SCALE_WIDTH - SCROLL_BAR_WIDTH;
    let chartCount = countCharts;
    
    let chartWidth = (Math.max(availableWidth / chartCount, MINIMAL_CHART_WIDTH) - MARGIN_BETWEEN_GRAPHS).toFixed(2);
    
    if (listContainers && listContainers.length <= index) {
      listContainer = document.createElement('ul');
      // console.log(listContainer);
      listContainer.id = index;
      listContainer.style.display = "block";
      listContainer.style.margin = "0";
      listContainer.style.padding = "0";
      listContainer.style.width = `${chartWidth}px`;

      if (index !== (listContainers?.length ?? 0) - 1)
        listContainer.style.marginRight = `${MARGIN_BETWEEN_GRAPHS}px`;

      if (index == 0)
        listContainer.style.marginLeft = `${TIME_SCALE_WIDTH}px`;//"2.5rem";

      listContainer.style.textAlign = "center";
      
      legendContainer?.appendChild(listContainer);
    } else if (listContainers){
      listContainer = listContainers[index];
    }
  
    return listContainer;
  };

export const TIME_SCALE_WIDTH = 40;
export const MARGIN_BETWEEN_GRAPHS = 15;
export const SCROLL_BAR_WIDTH = 10;