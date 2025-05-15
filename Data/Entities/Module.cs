using System.ComponentModel.DataAnnotations;

namespace Data.Entities
{
    public class Module : BaseEntity
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string MqttTopic { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public ICollection<Sensor> Sensors { get; set; } = new List<Sensor>();
    }
}
