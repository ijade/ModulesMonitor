using Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SensorEmulator.Services
{
    public class DistributionProviderService
    {
        private readonly Random _random;
        public DistributionProviderService()
        {
            _random = new Random();
        }

        public double GetNormalDistributedValue(EmulatedSensorSettings settings, int index)
        {
            double min = settings.Min;
            double max = settings.Max;
            double stdDev = settings.StdDev;
            double mean = (max + min) / 2;

            double u1 = 1.0 - _random.NextDouble();
            double u2 = 1.0 - _random.NextDouble();
            double randStdNormal = Math.Sqrt(-2.0 * Math.Log(u1))
                * Math.Sin(2.0 * Math.PI * u2 * index);                     //random normal(0,1)
            double randNormal = mean + stdDev * randStdNormal;      //random normal(mean,stdDev^2)

            return randNormal;
        }
    }
}
