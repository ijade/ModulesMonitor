namespace Common.Models
{
    public class SensorModel
    {
        public int Id { get; set; }

        public int PositionIndex { get; set; }

        public int DecimalPlaces { get; set; }

        public string MeasuringUnitName { get; set; } = string.Empty;

        public ModuleModel? Module { get; set; } = null;
    }
}
