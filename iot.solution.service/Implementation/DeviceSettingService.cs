using component.helper;
using component.logger;
using iot.solution.common;
using iot.solution.model.Repository.Interface;
using iot.solution.service.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;
using LogHandler = component.services.loghandler;
namespace iot.solution.service.Implementation
{
    public class DeviceSettingService : IDeviceSettingService
    {
        private readonly IDeviceSettingRepository _deviceSettingRepository;
        private readonly LogHandler.Logger _logger;

        public DeviceSettingService(IDeviceSettingRepository deviceSettingRepository,LogHandler.Logger logger)
        {
            _logger = logger;
            _deviceSettingRepository = deviceSettingRepository;
        }
        public Entity.BaseResponse<Entity.DeviceSetting> Get(Guid deviceId)
        {
            Entity.BaseResponse<Entity.DeviceSetting> setting = new Entity.BaseResponse<Entity.DeviceSetting>();
            try
            {
                setting = _deviceSettingRepository.Get(deviceId);
                return setting;
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex);
                return null;
            }
        }
        public Entity.ActionStatus Manage(Entity.DeviceSetting request)
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                if (request.guid == null || request.guid == Guid.Empty)
                {
                    var dbDeviceSetting = Mapper.Configuration.Mapper.Map<Entity.DeviceSetting, Model.DeviceSetting>(request);

                    dbDeviceSetting.Guid = request.guid;
                    dbDeviceSetting.DeviceGuid = request.deviceGuid;
                   

                    actionStatus = _deviceSettingRepository.Manage(dbDeviceSetting);
                    if (actionStatus.Data != null)
                    {
                        
                        actionStatus.Data = Get(request.deviceGuid).Data;
                    }
                    if (!actionStatus.Success)
                    {
                        _logger.ErrorLog(new Exception($"DeviceSetting is not added, Error: {actionStatus.Message}"));
                        actionStatus.Success = false;
                        actionStatus.Message = actionStatus.Message;
                    }
                }
                else
                {
                    var olddbDeviceSetting = _deviceSettingRepository.FindBy(x => x.DeviceGuid.Equals(request.deviceGuid)).FirstOrDefault();
                    if (olddbDeviceSetting == null)
                    {
                        throw new NotFoundCustomException($"{CommonException.Name.NoRecordsFound} : DeviceSetting");
                    }
                    var dbDeviceSetting = Mapper.Configuration.Mapper.Map(request, olddbDeviceSetting);
                  actionStatus = _deviceSettingRepository.Manage(dbDeviceSetting);
                    if (actionStatus.Data != null)
                    {
                        actionStatus.Data = Get(request.deviceGuid).Data;
                    }
                    if (!actionStatus.Success)
                    {
                        _logger.ErrorLog(new Exception($"DeviceSetting is not updated , Error: {actionStatus.Message}"));
                        actionStatus.Success = false;
                        actionStatus.Message = actionStatus.Message;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.ErrorLog( ex);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
       
    }
}
