using Common.Models.Paging;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Linq.Dynamic.Core;

namespace Common.Models.Paging
{
    /// <summary>
    /// Структура для отдачи пейджинга на клиент
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class PagedList<T>
    {
        public List<T> Items { get; private set; }
        public int CurrentPage { get; private set; }
        public int PageSize { get; private set; }
        public int TotalCount { get; private set; }


        public PagedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            TotalCount = count;
            PageSize = pageSize;
            CurrentPage = pageNumber;
            Items = items;
        }
    }

    public static class PaginationExtensions
    {
        /// <summary>
        /// Преобразует IQueryable в специальный объект для рендеринга на фронте, состоящий из самих айтемов + метаинформация для пагинатора
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="source"></param>
        /// <param name="parameters"></param>
        /// <returns></returns>
        public static async Task<PagedList<T>> ToPagedList<T>(this IQueryable<T> source, PagingParameters parameters)
        {
            var querySorted = source
                .AddSearching(parameters.Term, parameters.SearchableFields)
                .AddSorting(parameters.OrderBy);
            int count = querySorted.Count();
            var items = await querySorted
                .Skip(parameters.PageIndex * (int)parameters.PageSize)
                .Take((int)parameters.PageSize)
                .ToListAsync();

            return new PagedList<T>(items, count, parameters.PageIndex, (int)parameters.PageSize);
        }

        /// <summary>
        /// Данный метод добавляет в запрос сортировку по свойству объекта по имени этого свойства. 
        /// Работает только для свойств, если передать имя поля, вернёт ошибку.
        /// </summary>
        /// <param name="source"> Исходный запрос </param>
        /// <param name="orderByText"> Имя свойства, по которому будет выполняться сортировка. 
        /// Допускается передача имени в формате "{PropName}-desc", тогда сортировка будет выполняться в обратном порядке./param>
        /// <exception cref="Exception"> В случае, если свойство с таким именем не обнаружено. 
        /// Вероятно, имя передано в неправильном формате, либо является полем, а не свойством </exception>
        public static IQueryable<T> AddSorting<T>(this IQueryable<T> source, string fieldParam)
        {
            // Проверяем что имя свойства для сортировки не пустое
            if (string.IsNullOrEmpty(fieldParam))
                return source;

            // Делаем небольшие преобразования
            var formattedField = fieldParam.Replace('-', ' ');

            // Добавляем сортировку в запрос
            return source.OrderBy(formattedField);
        }
        public static IQueryable<T> AddSearching<T>(this IQueryable<T> source, string searchText, string searchableFieldsString)
        {
            var statements = new List<string>();
            string query = string.Empty;
            string[] searchableFields = searchableFieldsString.Split(", ");

            if (string.IsNullOrEmpty(searchText))
                return source;


            foreach (var propString in searchableFields)
            {
                statements.Add($"{propString}.ToLower().Contains(\"{searchText}\")");
                continue;
            }

            query = string.Join(" or ", statements);
            return source.Where(query);
        }
    }
}
