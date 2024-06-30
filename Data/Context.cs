using Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
    public class Context : DbContext
    {
        public Context(DbContextOptions options)
            :base(options)
        {

        }

        public DbSet<Module> Modules { get; set; }

        public DbSet<Sensor> Sensors {  get; set; }

        public DbSet<SensorValue> SensorValues { get; set; }
    }
}
