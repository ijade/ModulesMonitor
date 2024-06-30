using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Receiver.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Receiver
{
    public class Startup
    {
        IConfigurationRoot Configuration { get; }

        public Startup()
        {
            var builder = new ConfigurationBuilder()
                .AddNewtonsoftJsonFile("appsettings.json");

            Configuration = builder.Build();
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddLogging(configure =>
            {
                configure.AddConsole();
                configure.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Warning);
                configure.AddFile(Configuration["Logging:FilePath"]);
            });

            services.AddSingleton<IConfigurationRoot>(Configuration);
            services.AddSingleton<MqttReceiverService>();
        }
    }
}
