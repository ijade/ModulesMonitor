namespace Common.Models
{
    public class UserChartModel
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string MqttTopic { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public IEnumerable<SensorWithValuesModel> Sensors { get; set; } = new List<SensorWithValuesModel>();

    }
}
