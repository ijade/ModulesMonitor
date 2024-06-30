using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class Module
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public string? Description { get; set; }

        [Required]
        public string MqttTopic { get; set; }

        public DateTime CreatedAt { get; set; }

        public ICollection<Sensor> Sensors { get; set; }
    }
}
