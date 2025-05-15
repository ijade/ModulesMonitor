using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class SensorValue : BaseEntity
    {

        [Required]
        public DateTime ReadingDateTime {  get; set; }

        [Required]
        public string Value { get; set; } = string.Empty;

        [Required]
        public Sensor Sensor { get; set; } = null!;

        public int SensorId { get; set; }
    }
}
