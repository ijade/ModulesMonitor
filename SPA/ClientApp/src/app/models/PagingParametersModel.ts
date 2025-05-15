export class PagingParameters
{
    pageIndex: number;
    pageSize: number;
    orderBy!: string;
    orderIsDescending!: boolean;
    searchText!: string;

    constructor() {
        this.pageIndex = 0;
        this.pageSize = 50;
    }

    toQuery(): string {
        let query = `?pageIndex=${this.pageIndex}&pageSize=${this.pageSize}`

        if (this.orderBy) {
            query += `&orderBy=${this.orderBy}`;

            if (this.orderIsDescending) {
                query += `&orderIsDescending=${this.orderIsDescending}`;
            }
        }
        if(this.searchText){
            query += `&term=${encodeURIComponent(this.searchText)}`;
        }

        return query;
    }
}

