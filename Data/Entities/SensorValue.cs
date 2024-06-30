using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class SensorValue
    {
        [Key]
        public int Id {  get; set; }

        [Required]
        public DateTime ReadingDateTime {  get; set; }

        [Required]
        public string Value { get; set; }

        [Required]
        public Sensor Sensor { get; set; }
    }
}
