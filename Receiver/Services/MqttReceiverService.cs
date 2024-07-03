using Data;
using Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MQTTnet;
using MQTTnet.Client;
using System.Globalization;
using System.Text;

namespace Receiver.Services
{
    public class MqttReceiverService
    {
        public MqttClientOptions Options { get; }
        private IMqttClient client { get; }
        private List<Module> cachedModules;
        private CancellationToken cancellationToken;

        private Context _context;
        private readonly IConfigurationRoot _config;
        private readonly ILogger<MqttReceiverService> _logger;
        private readonly int reCachePulse;
        private readonly int reconnectDelay;
        private Task loopTask;

        private const string dateTimeFormat = "yyyy-MM-dd HH:mm:ss.fffzzz";
        private readonly CultureInfo LOCALE = new CultureInfo("en-US");

        public MqttReceiverService(ILoggerFactory loggerFactory, IConfigurationRoot config)
        {
            _config = config;
            _logger = loggerFactory.CreateLogger<MqttReceiverService>();

            var host = config["MqttClient:Host"];
            var port = Convert.ToInt32(config["MqttClient:Port"]);
            var clientId = config["MqttClient:ClientId"];
            var login = config["MqttClient:Login"];
            var password = config["MqttClient:Password"];

            reCachePulse = Convert.ToInt32(config["MqttClient:ReCachePulse"]);
            reconnectDelay = Convert.ToInt32(_config["MqttClient:ReconnectDelay"]);

            var factory = new MqttFactory();

            Options = factory.CreateClientOptionsBuilder()
                .WithCredentials(login, Encoding.UTF8.GetBytes(password))
                .WithTcpServer(host, port)
                .WithClientId(clientId)
                .WithWillQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                .Build();

            client = factory.CreateMqttClient();

            client.ApplicationMessageReceivedAsync += OnMessageReceivedAsync;
            client.ConnectedAsync += OnConnected;
            client.DisconnectedAsync += OnDisconnected;
        }
        private async Task OnConnected(MqttClientConnectedEventArgs arg)
        {
            _logger.LogInformation("Connected succesfully");
            var subscribeOptions = new MqttClientSubscribeOptionsBuilder()
                .WithTopicFilter("#", MQTTnet.Protocol.MqttQualityOfServiceLevel.AtLeastOnce, false, true, MQTTnet.Protocol.MqttRetainHandling.SendAtSubscribe)
                .Build();
            await client.SubscribeAsync(subscribeOptions);
        }
        private async Task OnDisconnected(MqttClientDisconnectedEventArgs arg)
        {
            _logger.LogInformation("Disconnected from mosquitto");

            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogInformation("Shutting down receiver...");
                return;
            }

            await Reconnect();
            return;
        }

        private async Task Reconnect()
        {
            await Task.Delay(reconnectDelay);

            await client.ConnectAsync(Options);
        }

        public async Task Disconnect()
        {
            _logger.LogInformation("Disconnecting from the server");
            await client.DisconnectAsync(MqttClientDisconnectReason.NormalDisconnection);
        }

        private async Task OnMessageReceivedAsync(MqttApplicationMessageReceivedEventArgs arg)
        {
            var value = Encoding.UTF8.GetString(arg.ApplicationMessage.Payload);
            await ProcessValue(arg.ApplicationMessage.Topic, value);
        }

        public async Task Start(CancellationToken ct)
        {
            cancellationToken = ct;

            cancellationToken.Register(Shutdown);

            loopTask = Task.Run(Loop);

            _logger.LogInformation("Connecting to the server");

            await client.ConnectAsync(Options);

            loopTask.Wait();
        }

        private async void Shutdown()
        {
            await Disconnect();

            try
            {
                await SaveChanges();
                _context.Dispose();
            }
            finally
            {
                Environment.Exit(0);
            }
        }

        private async Task SaveChanges()
        {
            _logger.LogInformation("Saving recorded messages");
            var count = await _context.SaveChangesAsync();
            _logger.LogInformation($"Context saved successfully\nCount of new records: {count}");
        }

        private async Task Loop()
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                using
                (
                    _context = new Context
                    (
                        new DbContextOptionsBuilder<Context>()
                            .UseNpgsql(_config.GetConnectionString("DefaultConnection"))
                            .Options
                    )
                )
                {
                    try
                    {
                        if (!client.IsConnected)
                        {
                            await Reconnect();
                        }
                        _logger.LogInformation("Loading boreholes");

                        cachedModules = await _context.Modules
                            .Include(x => x.Sensors)
                            .ToListAsync();

                        await Task.Delay(reCachePulse);


                        await SaveChanges();
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(e.Message);
                        _logger.LogError(e?.InnerException?.ToString());
                    }
                }
            }
        }

        private async Task ProcessValue(string topic, string message)
        {
            try
            {
                var module = cachedModules ?.FirstOrDefault(x => x.MqttTopic == topic);

                if (module == null)
                    return;

                var sensors = module.Sensors
                    .OrderBy(x => x.PositionIndex)
                    .ToList();

                _logger.LogDebug($"New message in looking topic received.\nTopic: {topic}\nMessage:{message}");

                // /WB-MAI6/wb-modbus-0-0/controls/Value
                // 2022-12-20 18:22:34.721+05:00;12.71138;3.57
                // 2023-07-07 08:09:21.469+00:00;12.621;2735;null
                var arr = message.Split(';');
                DateTimeOffset dateTimeOffset = DateTime.ParseExact(arr[0], dateTimeFormat, CultureInfo.InvariantCulture);
                var dateTime = dateTimeOffset.UtcDateTime.ToUniversalTime();

                int sensorIdx = 0;
                foreach (var sensor in sensors)
                {
                    if (arr.Length <= sensorIdx + 1)
                        continue;

                    var value = arr[sensorIdx + 1];

                    if (value == "null")
                        continue;

                    var valueReal = Convert.ToDouble(value, LOCALE);
                    value = Math.Round(valueReal, sensor.DecimalPlaces).ToString(LOCALE);

                    var valueSensor = new SensorValue();
                    valueSensor.ReadingDateTime = dateTime;
                    valueSensor.Value = value;
                    valueSensor.Sensor = sensor;

                    _context.Entry(valueSensor).State = EntityState.Added;

                    sensorIdx++;
                }

                _logger.LogDebug($"New message added to context successfully");
            }
            catch (Exception e)
            {
                _logger.LogError($"Error while recording message {e.Message}");
            }
        }
    }
}
