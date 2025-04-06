using AutoMapper;
using Common.Constants;
using Common.Models;
using Data;
using Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace SPA.Services
{
    public class ModuleService : GenericEntityService<Module, ModuleModel>
    {
        public ModuleService(ApplicationDbContext dbContext, IMapper mapper) : base(dbContext, mapper) { }

        public override async Task<ResultModel> Add(ModuleModel model)
        {
            ResultModel result = new();

            var newEntity = _mapper.Map<Module>(model);
            _ApplicationDbContext.Attach(newEntity);

            try
            {
                await _ApplicationDbContext.SaveChangesAsync();
            }
            catch (Exception e)
            {
                result.ErrorMessage = ErrorConstants.DATABASE;
            }

            return result;
        }

        public async override Task<ResultModel> Update(ModuleModel model)
        {
            ResultModel result = new();

            Module entity = EntitySet
                .Include(x => x.Sensors)
                .Single(x => x.Id == model.Id);
            _mapper.Map(model, entity);

            try
            {
                await _ApplicationDbContext.SaveChangesAsync();
            }
            catch (Exception e)
            {
                result.ErrorMessage = ErrorConstants.DATABASE;
            }

            return result;
        }
    }
}
