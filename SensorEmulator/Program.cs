using Microsoft.Extensions.DependencyInjection;
using SensorEmulator.Services;

namespace SensorEmulator
{
    internal class Program
    {
        static void Main(string[] args)
        {
            ServiceCollection services = new ServiceCollection();

            Startup startup = new Startup();
            startup.ConfigureServices(services);
            IServiceProvider serviceProvider = services.BuildServiceProvider();

            var mqttBrokerService = serviceProvider.GetService<MqttEmulatorService>();
            mqttBrokerService.Start().Wait();
        }
    }
}
