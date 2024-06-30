using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities
{
    public class Sensor
    {
        [Key]
        public int Id { get; set; }

        public int PositionIndex {  get; set; }

        public int DecimalPlaces {  get; set; }

        public string MeasuringUnitName { get; set; }

        [Required]
        public Module Module { get; set; }
    }
}
