using Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Receiver.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Receiver.Hubs;

namespace Receiver
{
    public class Startup
    {
        public IConfigurationRoot Configuration { get; }

        public Startup()
        {
            var configurationBuilder = new ConfigurationBuilder()
                .AddNewtonsoftJsonFile("appsettings.json");

            Configuration = configurationBuilder.Build();
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddLogging(configure =>
            {
                configure.AddConsole();
                configure.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Warning);
                configure.AddFile(Configuration["Logging:FilePath"]);
            });

            //services.AddDbContext<ApplicationDbContext>(options =>
            //    options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection")));
            services.AddDbContextFactory<ApplicationDbContext>(options =>
                options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection")));

            services.AddSingleton<IConfigurationRoot>(Configuration);
            services.AddSingleton<MqttReceiverService>();

            services.AddSignalR();
            services.AddCors(options => options.AddPolicy("CorsPolicy",
            builder =>
            {
                builder.AllowAnyHeader()
                       .AllowAnyMethod()
                       .SetIsOriginAllowed((host) => true)
                       .AllowCredentials();
            }));
        }
    }
}
