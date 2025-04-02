import { Inject, Injectable, InjectionToken } from '@angular/core';
import { environment } from 'src/environments/environment';

export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage
});

@Injectable({
  providedIn: "root"
})
export class StorageService {
  readonly basePrefix = "ModulesMonitorProject.";
  
  constructor(@Inject(BROWSER_STORAGE) public storage: Storage) { }

  get(key: string): string {
    key = this.basePrefix + key;
    let value = this.storage.getItem(key);
    if (value)
      return value;
    else
      return '';
  }

  set(key: string, value: string) {
    key = this.basePrefix + key;
    this.storage.setItem(key, value);
  }

  remove(key: string) {
    key = this.basePrefix + key;
    this.storage.removeItem(key);
  }
  
  check(key: string): boolean {
    key = this.basePrefix + key;
    return this.get(key) != undefined;
  }
}