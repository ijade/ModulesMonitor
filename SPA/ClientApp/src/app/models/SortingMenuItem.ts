export class SortingMenuItem {
    columnName: string;
    menuItemName: string;
    statusSelected: StatusSelected;
    searchable: boolean;

    public constructor(columnName: string, menuItemName: string, searchable: boolean = true) {
        this.columnName = columnName;
        this.menuItemName = menuItemName;
        this.statusSelected = 0;
        this.searchable = searchable;
    }

    parseOrderParam(): string {
        switch (this.statusSelected) {
            case 1: return this.columnName;
            case 2: return this.columnName + '-desc';
            default: return '';
        }
    }
    public ToString(): string{
        return this.columnName;
    }
}

export enum StatusSelected {
    IsNotSelected = 0,
    Selected = 1,
    SelectedAsDesc = 2
}