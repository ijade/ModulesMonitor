using Data.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MQTTnet;
using MQTTnet.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SensorEmulator.Services
{
    public class MqttEmulatorService
    {
        public MqttClientOptions Options { get; }
        private IMqttClient client { get; }
        private CancellationToken cancellationToken { get; set; }
        private Task loopTask { get; set; }

        private readonly ILogger<MqttEmulatorService> _logger;
        private readonly DistributionProviderService _distributionProviderService;
        private readonly List<EmulatedModule> _emulatedModules;
        private readonly int _reconnectDelay;
        private readonly int _messagePublishDelay;

        public MqttEmulatorService(ILoggerFactory loggerFactory, IConfigurationRoot config, DistributionProviderService distributionProviderService)
        {
            _logger = loggerFactory.CreateLogger<MqttEmulatorService>();
            _distributionProviderService = distributionProviderService;

            var host = config["MqttClient:Host"];
            var port = Convert.ToInt32(config["MqttClient:Port"]);
            var clientId = config["MqttClient:ClientId"];
            var login = config["MqttClient:Login"];
            var password = config["MqttClient:Password"];
            _emulatedModules = config.GetSection("FakeModules").Get<List<EmulatedModule>>();
            _reconnectDelay = Convert.ToInt32(config["MqttClient:ReconnectDelay"]);
            _messagePublishDelay = Convert.ToInt32(config["MqttClient:MessagePublishDelay"]);

            var factory = new MqttFactory();
            Options = factory.CreateClientOptionsBuilder()
                .WithCredentials(login, Encoding.UTF8.GetBytes(password))
                .WithTcpServer(host, port)
                .WithClientId(clientId)
                .WithWillQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                .Build();

            client = factory.CreateMqttClient();

            client.ConnectedAsync += OnConnected;
            client.DisconnectedAsync += OnDisconnected;

        }

        public async Task Start()
        {
            loopTask = Task.Run(Loop);
            await client.ConnectAsync(Options);
            await CreateTopics();

            loopTask.Wait();
        }


        private Task OnConnected(MqttClientConnectedEventArgs arg)
        {
            _logger.LogInformation("Client connected");
            return Task.CompletedTask;
        }

        private async Task OnDisconnected(MqttClientDisconnectedEventArgs arg)
        {
            _logger.LogInformation("Disconnected from mosquitto");

            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogInformation("Shutting down emulator...");
                return;
            }

            await Reconnect();
            return;
        }

        private async Task Reconnect()
        {
            await Task.Delay(_reconnectDelay);

            await client.ConnectAsync(Options);
        }

        public async Task Disconnect()
        {
            _logger.LogInformation("Disconnecting from the server");
            await client.DisconnectAsync(MqttClientDisconnectReason.NormalDisconnection);
        }

        private async void Shutdown()
        {
            await Disconnect();

            Environment.Exit(0);
        }

        public async Task CreateTopics()
        {
            _logger.LogInformation("Creating topics...");
            foreach (var fakeModule in _emulatedModules)
            {
                foreach (var fakeSensor in fakeModule.FakeSensors)
                {
                    foreach (var fakeTopic in fakeSensor.FakeTopics)
                    {
                        MqttApplicationMessage message = new MqttApplicationMessage();
                        message.Topic = fakeTopic.Name;
                        message.Payload = Encoding.UTF8.GetBytes(fakeTopic.Value);
                        await client.PublishAsync(message);
                        _logger.LogInformation($"Topic: {fakeTopic.Name} Value: {fakeTopic.Value}");
                    }
                }
            }
        }

        private async Task Loop()
        {
            while (true)
            {
                try
                {
                    if (!client.IsConnected)
                    {
                        await Reconnect();
                    }
                    _logger.LogInformation("Sending data...");
                    await SendMessagesValue();

                }
                catch (Exception e)
                {
                    _logger.LogError("While Sending data error:" + e.Message);
                }

                await Task.Delay(_messagePublishDelay);
            }
        }

        public async Task SendMessagesValue()
        {
            foreach (var fakeModule in _emulatedModules)
            {
                var messageBuilder = new StringBuilder();
                //2022-12-20 18:22:34.721+05:00;
                messageBuilder.Append(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss.fff\"+00:00\""));
                int i = 1;
                foreach (var fakeSensor in fakeModule.FakeSensors)
                {
                    messageBuilder.Append(';');
                    var value = _distributionProviderService.GetNormalDistributedValue(fakeSensor.EmulatedSensorSettings, i++);
                    messageBuilder.Append(value.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture));


                }
                var messageStr = messageBuilder.ToString();
                MqttApplicationMessage message = new MqttApplicationMessage();
                message.Topic = fakeModule.TopicValuesName;
                message.Payload = Encoding.UTF8.GetBytes(messageStr);
                await client.PublishAsync(message);
                _logger.LogInformation($"Topic: {fakeModule.TopicValuesName} Value: {messageStr}");
            }

        }
    }
}
