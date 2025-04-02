import { RoleModel } from './RoleModel';

export class TokenModel {
  token: string = "";
  expiredTime: string = "";
  userId: string = "";
  roles: Array<RoleModel> = [];
}