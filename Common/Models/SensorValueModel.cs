using System.ComponentModel.DataAnnotations;

namespace Common.Models
{
    public class SensorValueModel
    {
        public int Id { get; set; }

        public DateTime ReadingDateTime { get; set; }

        public string Value { get; set; } = string.Empty;

        public int SensorId { get; set; }
    }
}
