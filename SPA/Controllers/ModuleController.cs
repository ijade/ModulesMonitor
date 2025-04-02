using Common.Constants;
using Common.Models;
using Common.Models.Paging;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using SPA.Services;

namespace SPA.Controllers
{
    [Route("[controller]")]
    [ApiController]
    //[EnableCors]
    //[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = RoleConstants.All)]
    public class ModuleController : ControllerBase
    {
        private readonly ModuleService _service;
        public ModuleController(ModuleService service)
        {
            _service = service;
        }

        [HttpGet("all")]
        public async Task<ICollection<ModuleModel>> Get()
        {
            _service.UserClaims = User;
            return await _service.GetAll();
        }

        [HttpGet]
        public async Task<PagedList<ModuleModel>> GetPage([FromQuery] PagingParameters parameters)
        {
            _service.UserClaims = User;
            return await _service.GetPage(parameters);
        }

        [HttpGet("{id}")]
        public async Task<ModuleModel> GetById(long id)
        {
            _service.UserClaims = User;
            return await _service.GetById(id);
        }

        [HttpPost]
        public async Task<ResultModel> Add(ModuleModel model)
        {
            _service.UserClaims = User;
            return await _service.Add(model);
        }

        [HttpPut]
        public async Task<ResultModel> Update(ModuleModel model)
        {
            return await _service.Update(model);
        }

        [HttpDelete("{id}")]
        public async Task<ResultModel> Delete(long id)
        {
            return await _service.Delete(id);

        }
    }
}
