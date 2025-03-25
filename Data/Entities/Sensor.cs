using System.ComponentModel.DataAnnotations;

namespace Data.Entities
{
    public class Sensor : BaseEntity
    {
        public int PositionIndex {  get; set; }

        public int DecimalPlaces {  get; set; }

        public string MeasuringUnitName { get; set; } = string.Empty;

        [Required]
        public Module Module { get; set; } = null!;
    }
}
