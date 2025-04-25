import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { ApiAuthorizationModule } from 'src/api-authorization/api-authorization.module';
import { AuthorizeGuard } from 'src/api-authorization/authorize.guard';
import { AuthorizeInterceptor } from 'src/api-authorization/authorize.interceptor';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SpreadsheetsComponent } from './spreadsheets/spreadsheets.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatTable, MatTableModule } from '@angular/material/table';
import { ModulesComponent } from './spreadsheets/modules/modules.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ModuleModalAddEditComponent } from './spreadsheets/modules/module-modal-add-edit/module-modal-add-edit.component';
import { MatSelectModule } from '@angular/material/select';
import { SearchBarComponent } from './search/search-bar/search-bar.component';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { NotificationService } from './services/NotificationService';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SensorValueBindingComponent } from './spreadsheets/modules/module-modal-add-edit/sensor-value-binding/sensor-value-binding.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GraphComponent } from './fetch-data/graph/graph.component';
import { NGX_MAT_DATE_FORMATS, NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    SpreadsheetsComponent,
    ModuleModalAddEditComponent,
    ModulesComponent,
    SearchBarComponent,
    SensorValueBindingComponent,
    GraphComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ApiAuthorizationModule,
    MatProgressSpinnerModule,
    MatDialogModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule,
    MatTableModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgChartsModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSnackBarModule,
    NgxMatMomentModule,
    DragDropModule, 
    NgxMatDatetimePickerModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent, canActivate: [AuthorizeGuard] },
      { path: 'spreadsheet-modules', component: ModulesComponent },

    ]),
    NgChartsModule,
    BrowserAnimationsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizeInterceptor, multi: true },
    NotificationService,
    {
      provide: NGX_MAT_DATE_FORMATS,
      useValue: {
        display: {
          dateInput: 'DD.MM.YYYY, HH:mm:ss',
          monthYearLabel: 'MMM YYYY',
        },
      },
  },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
