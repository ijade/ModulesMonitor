export class FormModalModel<T> {
  isEditing: boolean = false;
  isChanged: boolean = false;
  content!: T;
}