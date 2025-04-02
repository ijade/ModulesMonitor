import { Inject, Injectable, InjectionToken } from '@angular/core';
import { GenericEntityApiService } from './GenericEntityApiService';
import { ModuleModel } from '../models/ModuleModel';

@Injectable({
    providedIn: "root"
})
export class ModuleService extends GenericEntityApiService<ModuleModel> {
    override EntityApiPath: string = "module";
    
}