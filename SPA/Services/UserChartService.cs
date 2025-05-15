using Common.Models;
using Data;
using Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace SPA.Services
{
    public class UserChartService
    {
        private readonly ApplicationDbContext _context;
        const int TakeLastValuesCount = 200;
        const int DefaultRangeMinutes = 8;

        public UserChartService(ApplicationDbContext context) { _context = context; }

        public async Task<ICollection<UserChartModel>> GetUserCharts()
        {
            var modules = await _context.Modules
                .Include(x => x.Sensors)
                .Select(x => new UserChartModel()
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    CreatedAt = x.CreatedAt,
                    MqttTopic = x.MqttTopic,
                    Sensors = x.Sensors.Select(y => new SensorWithValuesModel()
                    {
                        Id = y.Id,
                        DecimalPlaces = y.DecimalPlaces,
                        MeasuringUnitName = y.MeasuringUnitName,
                        ModuleId = x.Id,
                        PositionIndex = y.PositionIndex,
                        sensorValues = new List<SensorValueModel>()
                    })
                })
                .ToListAsync();

            DateTime rangeEnd = DateTime.UtcNow;
            DateTime rangeStart = rangeEnd.AddMinutes(-DefaultRangeMinutes);

            foreach (var module in modules)
            {
                foreach (var sensor in module.Sensors)
                {
                    sensor.sensorValues =  await _context.SensorValues
                        .Where(x => x.Sensor.Id == sensor.Id
                            && x.ReadingDateTime >= rangeStart
                            && x.ReadingDateTime <= rangeEnd
                        )
                        //.Take(TakeLastValuesCount)
                        .Select(x => new SensorValueModel()
                        {
                            Id = x.Id,
                            ReadingDateTime = x.ReadingDateTime,
                            SensorId = sensor.Id,
                            Value = x.Value,
                        })
                        .OrderBy(x => x.ReadingDateTime)
                        .ToListAsync();
                }
            }

            return modules;
        }
    }
}
