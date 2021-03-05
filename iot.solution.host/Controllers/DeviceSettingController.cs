using host.iot.solution.Filter;
using iot.solution.entity;
using iot.solution.entity.Structs.Routes;
using iot.solution.service.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using Entity = iot.solution.entity;

namespace host.iot.solution.Controllers
{
    [Route(DeviceSettingRoute.Route.Global)]
    [ApiController]
    public class DeviceSettingController : BaseController
    {

        private readonly IDeviceSettingService _deviceSettingService;
        public DeviceSettingController(IDeviceSettingService deviceSettingService)
        {
            _deviceSettingService = deviceSettingService;
        }

      
        [HttpGet]
        [Route(DeviceSettingRoute.Route.GetById, Name = DeviceSettingRoute.Name.GetById)]
        [EnsureGuidParameterAttribute("deviceId", "Device Setting")]
        public Entity.BaseResponse<Entity.DeviceSetting> Get(string deviceId)
        {
            if (deviceId == null || deviceId == string.Empty)
            {
                return new Entity.BaseResponse<Entity.DeviceSetting>(false, "Invalid Request");
            }

            Entity.BaseResponse<Entity.DeviceSetting> response = new Entity.BaseResponse<Entity.DeviceSetting>(true);
            try
            {

                response = _deviceSettingService.Get(Guid.Parse(deviceId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.DeviceSetting>(false, ex.Message);
            }
            return response;
        }

        [HttpPost]
        [Route(DeviceSettingRoute.Route.Manage, Name = DeviceSettingRoute.Name.Add)]
        public Entity.BaseResponse<Entity.DeviceSetting> Manage([FromBody]Entity.DeviceSetting request)
        {

            Entity.BaseResponse<Entity.DeviceSetting> response = new Entity.BaseResponse<Entity.DeviceSetting>(true);
            try
            {
                var status = _deviceSettingService.Manage(request);
                response.IsSuccess = status.Success;
                response.Message = status.Message;
                response.Data = status.Data;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.DeviceSetting>(false, ex.Message);
            }
            return response;
        }

      

      
      

    }
}