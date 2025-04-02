import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { LiteEvent } from "src/Utilites/LiteEvent";
import { TokenModel } from '../models/AuthModel';
import { ResultModel } from '../models/ResultModel';
import { UserModel } from '../models/UserModel';
import { ApiService } from './ApiService';
import { StorageService } from './StorageService';
import { UserService } from "./UserService";


@Injectable({
  providedIn: "root"
})
export class AuthService {
  private role: string = "";
  private userId: string = "";
  private token: string = "";

  roleChanged: LiteEvent<string> = new LiteEvent<string>();
  loggedIn: LiteEvent<AuthService> = new LiteEvent<AuthService>();
  loggedOut: LiteEvent<AuthService> = new LiteEvent<AuthService>();

  getRole(): string {
    return this.role;
  }
  getUserId(): string {
    return this.userId;
  }
  getToken(): string {
    return this.token;
  }

  async getUser(): Promise<UserModel>{
    return await this.userService.GetByToken();
  }

  isLoggedIn(): boolean {//TODO: надо поизучать, достаточно ли этого
    return this.userId != "";
  }
  public isAuthenticated(): boolean {
    return true;
    //TODO: change this
    return this.token != "";
  }

  constructor(private api: ApiService, private storage: StorageService, private userService: UserService, private router: Router) {
    api.authError.on(sender => this.authErrorOccured());
  }

  private authErrorOccured() {
    this.logout();
  }

  initialize() {
    if (this.storage.check("userId")) {
      this.userId = this.storage.get("userId");
      this.role = this.storage.get("role");
      this.token = this.storage.get("token");
      this.api.setToken(this.token);
      this.loggedIn.trigger(this);
    }
  }

  async register(model: UserModel): Promise<ResultModel<any>> {
    if (this.isLoggedIn()) {
      return {
        isSuccess: true,
        errorMessage: "ALREADY_LOGGED_IN",
        content: null
      };
    }

    let result = await this.api.post<ResultModel<TokenModel>>("auth/register", model);
    return this.parseResult(result);
  }

  async login(model: UserModel): Promise<ResultModel<TokenModel>> {
    if (this.isLoggedIn()) {
      return {
        isSuccess: true,
        errorMessage: "ALREADY_LOGGED_IN",
        content: null
      };
    }

    let result = await this.api.post<ResultModel<TokenModel>>("auth/login", model);
    return this.parseResult(result);
  }

  parseResult(result: ResultModel<TokenModel>): ResultModel<TokenModel> {
    if (result.isSuccess) {
      this.userId = result?.content?.userId || "";
      this.role = result?.content?.roles[0].name || "";
      this.token = result?.content?.token || "";

      this.setCookies(this.userId, this.role, this.token);
      this.api.setToken(this.token);

      this.loggedIn.trigger(this);
    }

    return result;
  }

  logout() {

    this.userId = "";
    this.role = "";
    this.token = "";

    this.setCookies("", "", "");
    this.api.setToken("");
    this.loggedOut.trigger(this);

    this.router.navigateByUrl("login");
  }

  private setCookies(userId: string, role: string, token: string) {
    this.storage.set("userId", userId);
    this.storage.set("role", role);
    this.storage.set("token", token);
  }


}