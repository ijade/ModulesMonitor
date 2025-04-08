using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Duende.IdentityServer.EntityFramework.Options;
using Data.Entities;
using System.Reflection.Metadata;

namespace Data;

public class ApplicationDbContext : ApiAuthorizationDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions options, IOptions<OperationalStoreOptions> operationalStoreOptions)
        : base(options, operationalStoreOptions)
    {

    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        modelBuilder.Entity<Sensor>()
            .HasOne(x => x.Module)
            .WithMany(x => x.Sensors)
            .HasForeignKey(nameof(Sensor.ModuleId));

        modelBuilder.Entity<SensorValue>()
            .HasOne(x => x.Sensor)
            .WithMany()
            .HasForeignKey(nameof(SensorValue.SensorId));

        base.OnModelCreating(modelBuilder);
    }

    public DbSet<Module> Modules { get; set; }

    public DbSet<Sensor> Sensors { get; set; }

    public DbSet<SensorValue> SensorValues { get; set; }
}
