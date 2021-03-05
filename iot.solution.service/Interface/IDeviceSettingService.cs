using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Response = iot.solution.entity.Response;
using Model = iot.solution.model.Models;

namespace iot.solution.service.Interface
{
    public interface IDeviceSettingService
    {
        Entity.BaseResponse<Entity.DeviceSetting> Get(Guid deviceId);
        Entity.ActionStatus Manage(Entity.DeviceSetting request);
    
    }
}
