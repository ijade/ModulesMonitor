using Common.Models;
using Data;
using Data.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using SPA.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddIdentityServer()
    .AddApiAuthorization<ApplicationUser, ApplicationDbContext>();

builder.Services.AddAuthentication()
    .AddIdentityServerJwt();

builder.Services.AddAutoMapper(options =>
{
    options.CreateMap<Module, ModuleModel>()
        .ReverseMap();

    options.CreateMap<Sensor, SensorModel>()
        .ReverseMap();
        //.ForMember(x => x.Module, x => x.Ignore());
    options.CreateMap<Sensor, SensorWithValuesModel>()
        .ReverseMap();

    options.CreateMap<SensorValue, SensorValueModel>()
        .ReverseMap();
});

builder.Services.AddTransient<UserChartService>();
builder.Services.AddTransient<ModuleService>();

builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();



var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseIdentityServer();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");
app.MapRazorPages();

app.MapFallbackToFile("index.html");;

app.Run();
