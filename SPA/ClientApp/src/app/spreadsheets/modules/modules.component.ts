import { ComponentType } from '@angular/cdk/portal';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IdNameModel } from 'src/app/models/IdNameModel';
import { SortingMenuItem } from 'src/app/models/SortingMenuItem';
import { NotificationService } from 'src/app/services/NotificationService';
import { BaseSpreadsheet } from '../BaseSpreadsheet';
import { ModuleModalAddEditComponent } from './module-modal-add-edit/module-modal-add-edit.component';
import {MatTableModule} from '@angular/material/table';
import { ModuleModel } from 'src/app/models/ModuleModel';
import { ModuleService } from 'src/app/services/ModuleService';
import { Moment } from 'moment';


@Component({
    selector: 'app-modules',
    templateUrl: './modules.component.html',
    host: { 'class': 'fill spreadsheet' },
    styleUrls: [ '../BaseSpreadsheet.scss']
})
export class ModulesComponent
    extends BaseSpreadsheet<ModuleModel, ModuleModalAddEditComponent> {
    displayedColumns: string[] = ['name', 'description', 'createdAt', 'buttons'];
    searchText: string | undefined;
    AddEditModalType: ComponentType<ModuleModalAddEditComponent> = ModuleModalAddEditComponent;
    constructor(
        service: ModuleService,
        dialog: MatDialog,
        notify: NotificationService
    ) {
        super(service, dialog, notify);
        this.fieldsForSorting = [
            new SortingMenuItem('Name', 'Название'),
            new SortingMenuItem('Description', 'Описание'),
            // new SortingMenuItem('CreatedAt', 'Дата создания'),
        ]
    }

    public DateToString(date: Moment): string{
        return date.toLocaleString();
    }
}
