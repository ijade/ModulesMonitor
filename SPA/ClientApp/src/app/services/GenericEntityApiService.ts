import { Injectable } from '@angular/core';
import { PagedList } from '../models/PagedListModel';
import { PagingParameters } from '../models/PagingParametersModel';
import { ResultModel } from '../models/ResultModel';
import { ApiService } from './ApiService';
import { SortingMenuItem } from '../models/SortingMenuItem';

@Injectable({
  providedIn: 'root'
})
export abstract class GenericEntityApiService<T> {
  // [x: string]: any;
  
  abstract readonly EntityApiPath: string

  constructor(protected apiService: ApiService) {
    
  }

  public async GetAll(): Promise<T[]> {
    let result = await this.apiService.get<T[]>(`${this.EntityApiPath}/all`);
    return result;
  }

  public async GetById(id: number): Promise<T> {
    let result = await this.apiService.get<T>(`${this.EntityApiPath}/${id}`);
    return result;
  }

  public async GetPage(pagingParams: PagingParameters, fieldsForSorting: SortingMenuItem[]): Promise<PagedList<T>> {
    var query = pagingParams.toQuery();
    if(fieldsForSorting != null) query += `&searchableFields=${fieldsForSorting.filter(x=>x.searchable).map(x => x.columnName).join(", ")}`;
    let result = await this.apiService.get<PagedList<T>>(`${this.EntityApiPath}${query}`);
    return result;
  }

  public async Add(model: T): Promise<ResultModel> {
    let result = await this.apiService.post<ResultModel>(`${this.EntityApiPath}/`, model);
    return result;
  }

  public async Update(model: T): Promise<ResultModel> {
    let result = await this.apiService.put<ResultModel>(`${this.EntityApiPath}/`, model);
    return result;
  }

  public async Delete(id: number): Promise<ResultModel> {
    let result = await this.apiService.delete<ResultModel>(`${this.EntityApiPath}/${id}`);
    return result;
  }
}