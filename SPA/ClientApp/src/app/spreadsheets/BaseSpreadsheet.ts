import { ComponentType } from "@angular/cdk/portal";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { GenericEntityApiService } from "../services/GenericEntityApiService";
import { NotificationService } from "../services/NotificationService";
import { FormModalModel } from "../models/FormModalModel";
import { PagingParameters } from "../models/PagingParametersModel";
import { PagedList } from "../models/PagedListModel";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { SortingMenuItem } from "../models/SortingMenuItem";
import { MessageConstants } from "../constants/MessageConstants";
import { PageSizes } from "../constants/PageSizes";
import { Sort } from '@angular/material/sort';
import { Observable } from "rxjs";

@Component({
  template: '',
  styleUrls: ['./BaseSpreadsheet.scss']
  })
export abstract class BaseSpreadsheet<TModel, TAddEditModal> implements OnInit {
  abstract displayedColumns: string[];
  abstract AddEditModalType: ComponentType<TAddEditModal>
  protected messageAdded: string = "Успешно добавлено";
  protected messageUpdated: string = "Успешно изменено";
  protected messageDeleted: string = "Успешно удалено";
  protected modalWidth = '535px';

  protected dataSource = new MatTableDataSource<TModel>();
  protected isLoading: boolean = true;

  protected pageSizes = PageSizes;
  protected pagedList: PagedList<TModel> = new PagedList();
  protected pagingParams: PagingParameters | undefined;
  fieldsForSorting: SortingMenuItem[] | undefined;
  private prevSearchText: string | undefined;
  public constructor(protected service: GenericEntityApiService<TModel>,
    protected dialog: MatDialog,
    protected notify: NotificationService) { }

  ngOnInit(): void {
    this.isLoading = true;
    
    if (this.paginator){
      this.paginator._intl.itemsPerPageLabel = "Записей на странице";
    }

    this.pagingParams = new PagingParameters();
    this.service.GetPage(this.pagingParams, this.fieldsForSorting!).then(result => {
      this.pagedList = result;
      this.dataSource.data = result.items;
      this.isLoading = false;
    });
  }

  @ViewChild('table') table: MatTable<TModel> | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  updateTable(): void {
    console.log("updating");
    this.isLoading = true;
    this.service.GetPage(this.pagingParams!, this.fieldsForSorting!).then(pagedList => {
      this.pagedList = pagedList;
      this.dataSource.data = pagedList.items
    });
    this.table?.renderRows();
    this.dataSource._updateChangeSubscription();
    this.isLoading = false;
  }

  paging(pagingEvent: PageEvent): void {
    if (this.pagingParams){
      this.pagingParams.pageIndex = pagingEvent.pageIndex;
      this.pagingParams.pageSize = pagingEvent.pageSize;
      this.updateTable();
    }
  }

  search(searchText: string): void{
    if (searchText == null
      || searchText.toLowerCase().trim() == this.prevSearchText
      // || searchText.length < 3
    )
        return;

    if (this.pagingParams){
      this.pagingParams.pageIndex = 0;
      this.pagingParams.searchText = searchText.toLowerCase().trim();
      this.prevSearchText = this.pagingParams.searchText;

      this.updateTable();
    }
  }

  sorting(sort: Sort): void{
    if (!this.fieldsForSorting || !this.pagingParams) return;
    var field  = this.fieldsForSorting[this.displayedColumns.indexOf(sort.active)];
    for (let anotherField of this.fieldsForSorting) {
      if (anotherField != field) {
        anotherField.statusSelected = 0;
        continue;
      }
      field.statusSelected = (field.statusSelected + 1) % 3;
    }

    this.pagingParams.orderBy = field.parseOrderParam();

    this.updateTable();
  }

  add(): void {
    const dialogRef = this.dialog.open(this.AddEditModalType, {
      width: this.modalWidth,
      data: { isEditing: false, content: {} } as FormModalModel<TModel>
    });

    //TODO: unsubscribe
    // .pipe(select(selectTodos), takeUntil(this.unsubscribe$)) // unsubscribe to prevent memory leak
    //   .subscribe(todos => this.todos = todos);            // unwrap observable
    dialogRef.afterClosed().subscribe((model) => this.onAddComplete(model));
  }

  onAddComplete(model: FormModalModel<TModel>): void {
    if (!model?.content) return;

    this.service.Add(model.content).then((result) => {
      if (result.isSuccess)
        this.updateTable();
      this.notify.success(this.messageAdded);
    });
  }

  edit(model: TModel): void {
    const dialogRef = this.dialog.open(this.AddEditModalType, {
      width: this.modalWidth,
      data: { isEditing: true, content: model } as FormModalModel<TModel>
    });

    dialogRef.afterClosed().subscribe((model) => this.onEditComplete(model));
    //((dialogRef as any).SaveSensor as Observable<any>).subscribe((model) => this.onEditComplete(model));
    // (dialogRef.componentInstance as any).SaveSensor.subscribe((model: FormModalModel<TModel>) => this.onEditComplete(model));

  }

  onEditComplete(model: FormModalModel<TModel>): void {
    if (!model?.content) return;

    this.service.Update(model.content).then((result) => {
      if (result.isSuccess)
        this.updateTable();
      this.notify.success(this.messageUpdated);
    });
  }

  //TODO: Implement delete modal dialog
  delete(id: number): void {
    if(!confirm("Вы уверены, что хотите удалить запись?")){
      return;
    }
    
    this.service.Delete(id).then((result) => {
      if (result.isSuccess) {
        this.updateTable();
        this.notify.success(this.messageDeleted);
      }
      else {
        this.notify.error((MessageConstants as any)[result.errorMessage]);
      }
    });
  }
}

