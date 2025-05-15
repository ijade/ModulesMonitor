using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Paging
{
    public class PagingParameters
    {
        public int PageIndex { get; set; }
        public PageSize PageSize { get; set; }
        public string OrderBy { get; set; } = string.Empty;
        public string Term { get; set; } = string.Empty;
        public string SearchableFields { get; set; } = string.Empty;
    }

    public enum PageSize
    {
        Ten = 10,
        Twenty = 20,
        Fifty = 50
    }
}
