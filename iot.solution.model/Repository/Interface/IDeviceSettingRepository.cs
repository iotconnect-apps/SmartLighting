using iot.solution.entity;
using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;
using Response = iot.solution.entity.Response;

namespace iot.solution.model.Repository.Interface
{
    public interface IDeviceSettingRepository : IGenericRepository<Model.DeviceSetting>
    {
        Entity.BaseResponse<Entity.DeviceSetting> Get(Guid deviceGuid);
        Entity.ActionStatus Manage(Model.DeviceSetting request);
       
        
        
    }
}
