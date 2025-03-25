using AutoMapper;
using Common.Models;
using Data;
using Data.Entities;

namespace SPA.Services
{
    public class ModuleService : GenericEntityService<Module, ModuleModel>
    {
        public ModuleService(ApplicationDbContext dbContext, IMapper mapper): base(dbContext, mapper) { }

        public override Task<ResultModel> Add(ModuleModel model)
        {
            throw new NotImplementedException();
        }

        public override Task<ResultModel> Update(ModuleModel model)
        {
            throw new NotImplementedException();
        }
    }
}
