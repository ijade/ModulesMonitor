using Microsoft.Extensions.DependencyInjection;
using Receiver.Services;

namespace Receiver
{
    public class Program
    {
        private static readonly CancellationTokenSource cts = new CancellationTokenSource();
        static void Main()
        {
            Console.CancelKeyPress += OnExit;
            AppDomain.CurrentDomain.ProcessExit += OnExit;

            IServiceCollection services = new ServiceCollection();

            Startup startup = new Startup();
            startup.ConfigureServices(services);
            IServiceProvider serviceProvider = services.BuildServiceProvider();

            var mqttReceiverService = serviceProvider.GetService<MqttReceiverService>();
            mqttReceiverService.Start(Program.cts.Token).Wait();
        }

        protected static void OnExit(object sender, EventArgs args)
        {
            cts.Cancel();
        }
    }
}
