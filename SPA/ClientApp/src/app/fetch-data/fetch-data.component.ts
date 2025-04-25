import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr';
import { formatDateTime, TimeFormat } from '../common/ToStringFunctions';
import { UserChartModel } from '../models/UserChartModel';
import { fromEvent, Subscription, throttleTime } from 'rxjs';
import { NgxMatDateAdapter, NgxMatDatetimepicker } from '@angular-material-components/datetime-picker';
import { SCROLL_THROTTLE_MS } from '@angular/material/tooltip';
import * as moment from 'moment';
import { QueryChartModel } from '../models/QueryModel';
import { RANGE_MULTIPLIER, PAGE_HEIGHT, STRETCH_ON_RT_PIXELS, DYNAMIC_SCROLL_SIZE_PERCENT, UserChartService } from '../services/UserChartService';
import { LocalStorage } from '../common/localStorage';
import { MatDialog } from '@angular/material/dialog';

export const USHORT_MAX: number = 65535;
export const TIME_SCALE_WIDTH = 40;
export const MARGIN_BETWEEN_GRAPHS = 15;
export const SCROLL_BAR_WIDTH = 10;

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html',
  styleUrls: ['./fetch-data.component.scss']
})
export class FetchDataComponent implements OnInit, OnDestroy {
  _hubConnection: HubConnection;
  chartDataSet: ChartDataset[] | any[] = [];

  @ViewChild('picker') datePicker!: NgxMatDatetimepicker<any>;
  @ViewChild('graphsContainer') private graphsContainer!: ElementRef;

  graphWidthStyles: any[] = [];
  lastRTdateTime: moment.Moment | null = null;

  _userCharts: UserChartModel[] = [];
  public get userCharts(): UserChartModel[] {
    return this._userCharts;
  }
  public set userCharts(userCharts: UserChartModel[]) {
    this._userCharts = userCharts;

    this.graphWidthStyles = [];

    if (userCharts == null) return;

    userCharts.forEach((val, i, arr) => {
      this.graphWidthStyles.push(this.getWidth(i));
    });
  }

  chartCount: number = 0;
  timeZones: number[] = [];
  currentTimezone: number = 0;
  isOnline: boolean = false;
  isLoading: boolean = true;
  utcDate: any;
  dateTime: any;
  pickerDateTime: any;
  range: number = 0;
  timesScrolled: number = 0;
  dynamicScrollRange: number = 0;
  updateScrollTimeout!: NodeJS.Timeout;
  updateScrollTimeoutCompleted: boolean = true;
  graphHeight: string = '0';
  isDynamicScrollLocked: boolean = false;

  private windowScroll$: Subscription = Subscription.EMPTY;

  private oldScrollPosition: number = 0;

  onOnline: EventEmitter<void> = new EventEmitter();
  onOffline: EventEmitter<void> = new EventEmitter();
  onUpdatedValues: EventEmitter<UserChartModel> = new EventEmitter();
  onUpdatedDislpayValues: EventEmitter<any> = new EventEmitter();
  onValuesAppended: EventEmitter<UserChartModel[]> = new EventEmitter();

  getTimeZoneNames!: Function;

  readonly rangeMinutesNames = [
    { name: '10 мин', value: 10 },
    { name: '30 мин', value: 30 },
    { name: '1 ч', value: 60 },
    { name: '2 ч', value: 120 },
    { name: '4 ч', value: 240 },
    { name: '8 ч', value: 480 },
    { name: '24 ч', value: 1440 },
  ]

  public lineChartType: ChartType = 'line';

  constructor(@Inject('BASE_URL') baseUrl: string,
    private userChartService: UserChartService,
    private dialog: MatDialog,
    private adapter: NgxMatDateAdapter<moment.Moment>
  ) {

    this._hubConnection = new HubConnectionBuilder()
      .withUrl('http://127.0.0.1:7777/hub', {
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true
      })
      .build();

    this._hubConnection.on('MessageReceived', (message) => {
      console.log(message);
    });

    this._hubConnection.start()
  }

  async ngOnInit(): Promise<void> {

    for (var i = -12; i <= 12; i++) {
      this.timeZones.push(i);
    }

    this.currentTimezone = parseInt(localStorage.getItem(LocalStorage.CURRENT_TIMEZONE) || '0');
    if (!Number.isInteger(this.currentTimezone)) {
      let defaultTimezone: number = new Date().getTimezoneOffset() / -60;
      localStorage.setItem(LocalStorage.CURRENT_TIMEZONE, defaultTimezone.toString());
      this.currentTimezone = defaultTimezone;
    }
    this.range = 30;

    this.dateTime = moment().utcOffset(this.currentTimezone).locale('ru-RU');
    this.pickerDateTime = this.dateTime;

    if (!this.isOnline) await this.switchOnline();

    this.graphHeight = RANGE_MULTIPLIER * PAGE_HEIGHT + "px";

    if (this.isOnline) this.onOnline.emit();

  }
  ngAfterViewInit() {
    this.windowScroll$ = fromEvent(this.graphsContainer.nativeElement.children[0], 'scrollend')
      .pipe(throttleTime(SCROLL_THROTTLE_MS))
      .subscribe(() => this.onScroll());
  }

  setOffline() {
    this.isOnline = false;

    this.onOffline.emit()
  }

  setOnline() {
    this.isOnline = true;

    this.onOnline.emit();
  }

  async switchOnline(): Promise<void> {
    this.isOnline = !this.isOnline;

    if (this.isOnline) {
      this.SetCurrentTime();
      await this.UpdateTime();

      this.onOnline.emit();
    }
    else {
      await this.UpdateTime();

      this.onOffline.emit();
    }

    this.userCharts = this.userCharts;
  }
  SetCurrentTime(): void {
    this.dateTime = moment().utcOffset(this.currentTimezone).locale('ru-RU');
  }

  async UpdateTime(): Promise<void> {
    localStorage.setItem(LocalStorage.CURRENT_TIMEZONE, this.currentTimezone.toString());

    this.pickerDateTime = this.dateTime;

    await this.UpdateData();
  }
  UpdateTimeZone(): void {
    this.dateTime = moment(this.pickerDateTime.utcOffset(this.currentTimezone));
    this.UpdateTime();
  }

  async UpdateData(): Promise<void> {
    this.isLoading = true;
    this.timesScrolled = 0;
    this.dynamicScrollRange = this.range;
    this.dateTime = moment(this.pickerDateTime).utcOffset(this.currentTimezone);

    let query = new QueryChartModel;
    query.dateTime = moment(this.dateTime).format();
    query.rangeMinutes = this.getRange();

    this.userCharts = await this.userChartService.GetQuery(query);

    setTimeout(() => this.isLoading = false, 0);
  }

  public getRange(): number {
    return this.range * RANGE_MULTIPLIER;
  }
  public getDynamicRange(timesScrolledOffset: number = 0): number {
    return this.getRange() + Math.floor((this.timesScrolled + timesScrolledOffset) * this.getRange() * (DYNAMIC_SCROLL_SIZE_PERCENT / 100));
  }


  getFormattedDate(date: string): string {
    return formatDateTime(date);
  }

  onDataDrawn(isInitial: boolean = false): void {
    if (isInitial) {
      this.graphHeight = (PAGE_HEIGHT * RANGE_MULTIPLIER) + "px";
    }

    setTimeout((x: number) => {
      this.scrollToBottom();
    }, 1500);

    this.windowScroll$ = fromEvent(this.graphsContainer.nativeElement.children[0], 'scrollend')
      .pipe(throttleTime(SCROLL_THROTTLE_MS))
      .subscribe(() => this.onScroll());
  }

  async onScroll(isScrollingUp: boolean = true): Promise<void> {
    if (this.isDynamicScrollLocked) return;

    // var natEl = this.graphsContainer.nativeElement.children[0];
    // var scrollPercentage = (1 - natEl.scrollTop / natEl.scrollHeight) * 100;
    // var oldScrollPosition = natEl.scrollTop;

    // this.onUpdatedDislpayValues.emit(this.graphsContainer.nativeElement.children[0]);

    // if (scrollPercentage < SCROLL_THRESHOLD_PERCENT) return;

    // this.isDynamicScrollLocked = true;

    // this.timesScrolled += 1;

    // if (this.isOnline) {
    //   await this.switchOnline();

    //   this.isDynamicScrollLocked = false;
    //   return;
    // }


    // if (this.isGraph) {
    //   let userCharts = this.sortUserCharts(await this.querySegment());
    //   userCharts.forEach((userChart) => {
    //     this.onUpdatedValues.emit(userChart);
    //   });

    //   this.graphHeight = parseInt(
    //     this.graphHeight.substring(0, this.graphHeight.length - 2)
    //   ) + DYNAMIC_SCROLL_PAGE_COUNT * PAGE_HEIGHT + "px";
    //   natEl.scrollTo(0, oldScrollPosition + PAGE_HEIGHT * DYNAMIC_SCROLL_PAGE_COUNT - GRAPGH_HEADER_HEIGHT);
    // } else {
    //   let userTable = await this.queryTableSegment();

    //   this.oldScrollPosition = oldScrollPosition;
    //   this.onValueTableAppended.emit(userTable);
    // }

    this.isDynamicScrollLocked = false;
  }
  
  onGraphStretch(
    lastUpdate: moment.Moment
  ) {
    if (this.lastRTdateTime && lastUpdate.diff(this.lastRTdateTime, 'minutes') == 0) {
      return;
    }

    //TODO: Calculate stretch from range and page height (including height for title)
    this.graphHeight = parseInt(this.graphHeight.substring(0, this.graphHeight.length - 2)) + STRETCH_ON_RT_PIXELS + "px";
    this.scrollToBottom();
    this.lastRTdateTime = lastUpdate;
  }



  onDateChange() {
    this.setOffline();

    this.UpdateData();
  }

  ngOnDestroy(): void {
    this.onOffline.emit();
    this.windowScroll$.unsubscribe();
  }

  onPageRefresh() {
    this.onOffline.emit();
  }

  getWidth(index: number) {
    const MINIMAL_CHART_WIDTH = 300;
    const availableWidth = window.innerWidth - TIME_SCALE_WIDTH - SCROLL_BAR_WIDTH;

    this.chartCount = this.userCharts.length;

    let chartWidth = (Math.max(availableWidth / this.chartCount, MINIMAL_CHART_WIDTH) - MARGIN_BETWEEN_GRAPHS).toFixed(2);

    return (index === 0)
      ? { width: `calc(${chartWidth}px + ${TIME_SCALE_WIDTH}px)` }
      : { width: `${chartWidth}px` };
  }

  scrollToBottom() {
    let elt = this.graphsContainer?.nativeElement.children[0];

    elt.scrollTo(0, elt.scrollHeight);
  }
}