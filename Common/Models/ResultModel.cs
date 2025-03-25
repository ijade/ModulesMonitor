namespace Common.Models
{
    public class ResultModel
    {
        public ResultModel()
        {
        }

        public ResultModel(string errorMessage)
        {
            if (string.IsNullOrEmpty(errorMessage))
            {
                throw new ArgumentException("Сообщение не может быть пустым.", nameof(errorMessage));
            }

            ErrorMessage = errorMessage;
        }

        public bool IsSuccess => ErrorMessage == null;

        public string ErrorMessage { get; set; }
    }

    public class ResultModel<T> : ResultModel
    {
        public ResultModel()
        {
        }

        public ResultModel(T content)
        {
            Content = content;
        }

        public ResultModel(string errorMessage)
            : base(errorMessage)
        {
        }
        public T Content { get; set; }

    }

    public class ResultListModel<T> : ResultModel<T>
    {
        public int TotalCount { get; set; }
        public int PageCount { get; set; }
        public IEnumerable<T> Data { get; set; }
    }
}
