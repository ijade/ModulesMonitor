using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Receiver.Hubs;
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

            //IServiceCollection services = new ServiceCollection();

            var builder = WebApplication.CreateBuilder();

            Startup startup = new Startup();
            startup.ConfigureServices(builder.Services);

            var app = builder.Build();

            var mqttReceiverService = app.Services.GetService<MqttReceiverService>();
            mqttReceiverService.Start(Program.cts.Token);


            //if (app.Environment.IsDevelopment())
            //{
            //    app.UseMigrationsEndPoint();
            //}
            //else
            //{
            //    app.UseHsts();
            //}

            //app.UseHttpsRedirection();
            //app.UseStaticFiles();
            app.UseRouting();
            app.UseCors("CorsPolicy");

            //app.UseAuthentication();
            //app.UseIdentityServer();
            //app.UseAuthorization();

            //app.MapControllerRoute(
            //    name: "default",
            //    pattern: "{controller}/{action=Index}/{id?}");
            //app.MapRazorPages();

            //app.MapFallbackToFile("index.html"); ;

            app.MapHub<ChatHub>("/hub");

            app.Run();
        }

        protected static void OnExit(object sender, EventArgs args)
        {
            cts.Cancel();
        }
    }
}
