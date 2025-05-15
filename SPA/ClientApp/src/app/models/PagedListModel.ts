export class PagedList<T>
{
    items!: Array<T>;
    currentPage!: number;
    pageSize!: number;
    totalCount!: number;
}