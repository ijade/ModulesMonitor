import { Inject, Injectable, InjectionToken } from '@angular/core';
import { ResultModel } from '../models/ResultModel';
import { UserModel } from '../models/UserModel';
import { UserPasswordChangeModel } from '../models/UserPasswordChangeModel';
import { GenericEntityApiService } from './GenericEntityApiService';

@Injectable({
    providedIn: "root"
})
export class UserService extends GenericEntityApiService<UserModel> {

    override EntityApiPath: string = "user";

    async GetByToken(): Promise<UserModel> {
        let result = await this.apiService.get<ResultModel<UserModel>>(`${this.EntityApiPath}/token`);
        return result.content!;
    }

    override async Delete(id: string | any): Promise<ResultModel> {
        let result = await this.apiService.delete<ResultModel>(`${this.EntityApiPath}/${id}`);
        return result;
    }

    public async UpdatePassword(model: UserPasswordChangeModel): Promise<ResultModel> {
        let result = await this.apiService.put<ResultModel>(`${this.EntityApiPath}/password`, model);
        return result;
    }

}