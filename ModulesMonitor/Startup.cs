using Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ModulesMonitor
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Configuration = configuration;
            Env = env;
        }

        public IConfiguration Configuration { get; }
        private IWebHostEnvironment Env { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddLogging(configure =>
            {
                configure.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Warning);
                configure.AddFile(Configuration["Logging:FilePath"], LogLevel.Warning);
            });
            services.AddCors();
            services.AddControllers()
                .AddNewtonsoftJson(options =>
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
                );

            services.AddHttpClient();
            services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

            services.AddSwaggerGen();

            //AddAuthentication(services);

            services.AddDbContext<Context>(options =>
            {
                options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection"));
                if (Env.IsDevelopment())
                    options.LogTo((x) => { System.Diagnostics.Debug.WriteLine(x); }, LogLevel.Information);
            });

            RegisterServices(services);
            //RegisterAutoMapper(services);
        }

        private void RegisterServices(IServiceCollection services)
        {
            services.AddSingleton<IConfiguration>(Configuration);
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, Context context)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors(options =>
            {
                options.WithOrigins("http://localhost:4200/");
                options.WithOrigins("http://localhost:9998/");
                options.AllowAnyOrigin();
                options.AllowAnyMethod();
                options.AllowAnyHeader();
            });

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();

            });

            context.Database.Migrate();
        }
    }
}
