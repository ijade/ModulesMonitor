using Common.Models;
using Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPA.Services;

namespace SPA.Controllers;

//[Authorize]
[ApiController]
[Route("[controller]")]
public class UserChartController : ControllerBase
{

    private readonly ILogger<UserChartController> _logger;
    private readonly UserChartService _userChartService;

    public UserChartController(ILogger<UserChartController> logger, UserChartService userChartService)
    {
        _logger = logger;
        _userChartService = userChartService;
    }

    [HttpGet("query")]
    public async Task<ICollection<UserChartModel>> GetUserCharts()
    {
        return await _userChartService.GetUserCharts();
    }
}
