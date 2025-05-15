using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Npgsql;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using Data.Entities;
using Data;
using Common.Models.Paging;
using Common.Models;
using Common.Constants;
using System.Security.Claims;

namespace SPA.Services
{
    abstract public class GenericEntityService<TEntity, TModel> where TEntity : BaseEntity, new()
    {

        protected readonly ApplicationDbContext _ApplicationDbContext;
        protected readonly IMapper _mapper;
        public ClaimsPrincipal UserClaims {  get; set; }

        public GenericEntityService(ApplicationDbContext ApplicationDbContext, IMapper mapper)
        {
            _ApplicationDbContext = ApplicationDbContext;
            _mapper = mapper;
        }
        internal virtual DbSet<TEntity> EntitySet
        {
            get
            {
                return _ApplicationDbContext.Set<TEntity>();
            }
        }

        virtual public async Task<ICollection<TModel>> GetAll()
        {
            var result = await EntitySet.ProjectTo<TModel>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return result;
        }

        virtual public async Task<TModel> GetById(long id)
        {
            var result = await EntitySet
                .Where(x => x.Id == id)
                .ProjectTo<TModel>(_mapper.ConfigurationProvider)
                .SingleAsync();

            return result;
        }

        virtual public async Task<PagedList<TModel>> GetPage(PagingParameters parameters)
        {
            var result = await EntitySet.ProjectTo<TModel>(_mapper.ConfigurationProvider)
                .ToPagedList(parameters);
            
            return result;
        }
       
        abstract public Task<ResultModel> Add(TModel model);

        abstract public Task<ResultModel> Update(TModel model);

        virtual public async Task<ResultModel> Delete(long id)
        {
            TEntity entity = await EntitySet.FirstOrDefaultAsync(x => x.Id == id);

            try
            {
                _ApplicationDbContext.Entry(entity).State = EntityState.Deleted;

                await _ApplicationDbContext.SaveChangesAsync();
                return new ResultModel();
            }
            catch (Exception e)
            {
                //if (e is DbUpdateException dbUE && dbUE.InnerException is PostgresException pe && pe.ErrorCode == -2147467259)
                //{
                //    if (entity.GetType() == typeof(SensorParameter))
                //        return new ResultModel(ErrorConstants.PARAMETER_USED_IN_BOREHOLES);

                //    return new ResultModel(ErrorConstants.CASCADE_DELETE);
                //}

                return new ResultModel(ErrorConstants.DATABASE);
            }
        }
    }
}
