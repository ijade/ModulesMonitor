namespace Common.Models
{
    public class SensorWithValuesModel
    {
        public int Id { get; set; }

        public int PositionIndex { get; set; }

        public int DecimalPlaces { get; set; }

        public string MeasuringUnitName { get; set; } = string.Empty;

        public int ModuleId { get; set; }
        public ICollection<SensorValueModel> sensorValues { get; set; } = new List<SensorValueModel>();
    }
}
