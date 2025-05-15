import { RoleModel } from './RoleModel';

export class UserModel {
  id!: string;
  name!: string;
  email!: string;
  username!: string;
  password!: string;
  roles: Array<RoleModel> = [];
  rolesNames: Array<string> = [];
}