import { HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LiteEvent } from 'src/Utilites/LiteEvent';


@Injectable({
  providedIn: "root"
})
export class ApiService {
  readonly baseAddress = environment.apiBaseUrl;
  token: string = "";

  authError: LiteEvent<ApiService> = new LiteEvent<ApiService>();

  constructor(private http: HttpClient) { }

  setToken(token: string) {
    this.token = token;
  }

  private getQueryParameters(object:any):string{
    let httpParams = new HttpParams({ fromObject: object })
    return httpParams.toString();
  }
  
  getWithQueryParams<T>(url: string, paramObject: any): Promise<T> {
    let stringParam = this.getQueryParameters(paramObject);
    return this.get<T>(url+stringParam);
  }

  get<T>(url: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.http.get<T>(this.baseAddress + url, this.getOptions()).subscribe(
        response => resolve(response),
        error => this.errorHandler(error, reject)
      );
    }).catch();
  }

  async downloadGet<T>(url: string, fileName: string) {
    return new Promise<T>((resolve, reject) => {
      this.http.get(this.baseAddress + url, this.getOptionsForDownload()).subscribe(
        response => {
          this.downloadFile(response, fileName);
        },
        error => this.errorHandler(error, reject)
      );
    }).catch();
  }

  async downloadPost<T>(url: string, body: any , fileName: string) {
    return new Promise<T>((resolve, reject) => {
      this.http.post(this.baseAddress + url, body, this.getOptionsForDownload()).subscribe(
        response => {
          this.downloadFile(response, fileName);
        },
        error => this.errorHandler(error, reject)
      );
    }).catch();
  }

  private downloadFile(data: any, name: string) {
    const downloadedFile = new Blob([data], { type: data.type });
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.download = name;
    a.href = URL.createObjectURL(downloadedFile);
      a.target = '_blank';
    a.click();
    document.body.removeChild(a);
  }

  getOptions() {
    return {
      headers: new HttpHeaders().set("Authorization", "Bearer " + this.token)
    };
  }

  getOptionsForDownload() : any {
    return {
      headers: new HttpHeaders().set("Authorization", "Bearer " + this.token),
      responseType: "blob"
    };
  }

  post<T>(url: string, body: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.http.post<T>(this.baseAddress + url, body, this.getOptions()).subscribe(
        response => resolve(response),
        error => this.errorHandler(error, reject)
      );
    }).catch();
  }

  put<T>(url: string, body: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.http.put<T>(this.baseAddress + url, body, this.getOptions())
        .subscribe(
          response => resolve(response),
          error => this.errorHandler(error, reject)
        );
    });
  }

  delete<T = null>(url: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.http.delete<T>(this.baseAddress + url, this.getOptions())
        .subscribe(
          response => resolve(response),
          error => this.errorHandler(error, reject)
        );
    });
  }

  private errorHandler(error: any, reject: (reason?: any) => void) {

    //TODO: Убрать это, так как у нас есть HttpInterceptor, который перехватывает все ошибки
    switch (error.status){
      case 401:
        this.authError.trigger(this);
        break;
        
    }
    reject(error);
  }
}