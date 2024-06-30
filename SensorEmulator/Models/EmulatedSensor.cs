using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public class EmulatedSensor
    {
        public EmulatedSensorSettings EmulatedSensorSettings { get; set; }
        public List<EmulatedTopic> FakeTopics { get; set; }
        private int i = 0;
    }
}
