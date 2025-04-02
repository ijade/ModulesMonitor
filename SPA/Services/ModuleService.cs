using AutoMapper;
using Common.Models;
using Data;
using Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace SPA.Services
{
    public class ModuleService : GenericEntityService<Module, ModuleModel>
    {
        public ModuleService(ApplicationDbContext dbContext, IMapper mapper): base(dbContext, mapper) { }

        public override Task<ResultModel> Add(ModuleModel model)
        {
            throw new NotImplementedException();
        }

        public async override Task<ResultModel> Update(ModuleModel model)
        {
            Module entity = _mapper.Map<ModuleModel, Module>(model);

            await SaveSensors(model, entity);
            await _ApplicationDbContext.SaveChangesAsync();

            return new() { ErrorMessage = null };
        }

        public async Task SaveSensors(ModuleModel model, Module entity)
        {
            var newSensorIds = model.Sensors.Select(x => x.Id);

            foreach (var existingSensor in entity.Sensors)
            {
                if (newSensorIds.Contains(existingSensor.Id))
                {
                    _mapper.Map(model.Sensors.First(x => x.Id == existingSensor.Id), existingSensor);
                    _ApplicationDbContext.Entry(existingSensor).State = EntityState.Modified;
                }
                else
                {
                    _ApplicationDbContext.Entry(existingSensor).State = EntityState.Deleted;
                }
            }
        }
    }
}
