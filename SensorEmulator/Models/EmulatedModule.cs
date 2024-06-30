using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Models
{
    public class EmulatedModule
    {
        public List<EmulatedSensor> FakeSensors { get; set; }

        public string TopicValuesName { get; set; }
    }
}
