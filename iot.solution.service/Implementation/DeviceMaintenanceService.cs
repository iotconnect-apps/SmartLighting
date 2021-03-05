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
    public class DeviceMaintenanceService : IDeviceMaintenanceService
    {
        private readonly IDeviceMaintenanceRepository _deviceMaintenanceRepository;
        private readonly IEntityRepository _entityRepository;


       
        private readonly LogHandler.Logger _logger;

        public DeviceMaintenanceService(IDeviceMaintenanceRepository entityMaintenanceRepository, IEntityRepository entityRepository,LogHandler.Logger logger)
        {
            _logger = logger;
            _deviceMaintenanceRepository = entityMaintenanceRepository;
            _entityRepository = entityRepository;
          
        }
      
        public List<Entity.DeviceMaintenance> Get()
        {
            try
            {

                return _deviceMaintenanceRepository.GetAll().Select(p => Mapper.Configuration.Mapper.Map<Entity.DeviceMaintenance>(p)).ToList();
            }
            catch (Exception ex)
            {

                _logger.ErrorLog(ex);
                return new List<Entity.DeviceMaintenance>();
            }
        }
        public Entity.DeviceMaintenanceDetail Get(Guid id, DateTime currentDate, string timeZone)
        {
            Entity.DeviceMaintenanceDetail maintenance = new Entity.DeviceMaintenanceDetail();
            try
            {
                //maintenance = _deviceMaintenanceRepository.FindBy(t => t.Guid == id).Select(p => Mapper.Configuration.Mapper.Map<Entity.DeviceMaintenance>(p)).FirstOrDefault();
                //if (maintenance != null) {
                //    maintenance.BuildingGuid = _entityRepository.FindBy(t => t.Guid == maintenance.EntityGuid).FirstOrDefault().ParentEntityGuid;

                //}                
                //return maintenance;
                maintenance = _deviceMaintenanceRepository.Get(id, Convert.ToDateTime(currentDate), timeZone);
                return maintenance;

            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex);
                return null;
            }
        }
        public Entity.ActionStatus Manage(Entity.DeviceMaintenance request)
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                if (request.Guid == null || request.Guid == Guid.Empty)
                {
                    var dbDeviceMaintenance = Mapper.Configuration.Mapper.Map<Entity.DeviceMaintenance, Model.DeviceMaintenance>(request);

                    dbDeviceMaintenance.Guid = request.Guid;
                    dbDeviceMaintenance.CompanyGuid = SolutionConfiguration.CompanyId;
                    DateTime dateValue;
                    if (DateTime.TryParse(request.StartDateTime.ToString(), out dateValue))
                    {
                        dbDeviceMaintenance.StartDateTime = dateValue.AddMinutes(-double.Parse(request.TimeZone)); //TimeZoneInfo.ConvertTimeBySystemTimeZoneId(dateValue, request.TimeZone, "UTC");
                    }
                    if (DateTime.TryParse(request.EndDateTime.ToString(), out dateValue))
                    {
                        dbDeviceMaintenance.EndDateTime = dateValue.AddMinutes(-double.Parse(request.TimeZone)); //TimeZoneInfo.ConvertTimeBySystemTimeZoneId(dateValue, request.TimeZone, "UTC");
                    }
                    actionStatus = _deviceMaintenanceRepository.Manage(dbDeviceMaintenance);
                    if (actionStatus.Data != null)
                    {
                        //   actionStatus.Data = Mapper.Configuration.Mapper.Map<Model.DeviceMaintenance, Entity.DeviceMaintenance>(actionStatus.Data);
                        actionStatus.Data = Get(actionStatus.Data, DateTime.Now, request.TimeZone);
                    }
                    if (!actionStatus.Success)
                    {
                        _logger.ErrorLog(new Exception($"DeviceMaintenance is not added, Error: {actionStatus.Message}"));
                        actionStatus.Success = false;
                        actionStatus.Message = actionStatus.Message;
                    }
                }
                else
                {
                    var olddbDeviceMaintenance = _deviceMaintenanceRepository.FindBy(x => x.Guid.Equals(request.Guid)).FirstOrDefault();
                    if (olddbDeviceMaintenance == null)
                    {
                        throw new NotFoundCustomException($"{CommonException.Name.NoRecordsFound} : DeviceMaintenance");
                    }
                    var dbDeviceMaintenance = Mapper.Configuration.Mapper.Map(request, olddbDeviceMaintenance);
                    dbDeviceMaintenance.CompanyGuid = SolutionConfiguration.CompanyId;
                    DateTime dateValue;
                    if (DateTime.TryParse(request.StartDateTime.ToString(), out dateValue))
                    {
                        dbDeviceMaintenance.StartDateTime = dateValue.AddMinutes(-double.Parse(request.TimeZone)); //TimeZoneInfo.ConvertTimeBySystemTimeZoneId(dateValue, request.TimeZone, "UTC");
                    }
                    if (DateTime.TryParse(request.EndDateTime.ToString(), out dateValue))
                    {
                        dbDeviceMaintenance.EndDateTime = dateValue.AddMinutes(-double.Parse(request.TimeZone)); //TimeZoneInfo.ConvertTimeBySystemTimeZoneId(dateValue, request.TimeZone, "UTC");
                    }
                    actionStatus = _deviceMaintenanceRepository.Manage(dbDeviceMaintenance);
                    if (actionStatus.Data != null)
                    {
                        actionStatus.Data = Mapper.Configuration.Mapper.Map<Model.DeviceMaintenance, Entity.DeviceMaintenance>(dbDeviceMaintenance);
                    }
                    if (!actionStatus.Success)
                    {
                        _logger.ErrorLog(new Exception($"DeviceMaintenance is not updated , Error: {actionStatus.Message}"));
                        actionStatus.Success = false;
                        actionStatus.Message = actionStatus.Message;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.ActionStatus Delete(Guid id)
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                var dbDeviceMaintenance = _deviceMaintenanceRepository.FindBy(x => x.Guid.Equals(id)).FirstOrDefault();
                if (dbDeviceMaintenance == null)
                {
                    throw new NotFoundCustomException($"{CommonException.Name.NoRecordsFound} : DeviceMaintenance");
                }
                dbDeviceMaintenance.IsDeleted = true;             
                return _deviceMaintenanceRepository.Update(dbDeviceMaintenance);     
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.SearchResult<List<Entity.DeviceMaintenanceDetail>> List(Entity.SearchRequest request)
        {
            try
            {
                var result = _deviceMaintenanceRepository.List(request);
                return new Entity.SearchResult<List<Entity.DeviceMaintenanceDetail>>()
                {
                    Items = result.Items.Select(p => Mapper.Configuration.Mapper.Map<Entity.DeviceMaintenanceDetail>(p)).ToList(),
                    Count = result.Count
                };
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex);
                return new Entity.SearchResult<List<Entity.DeviceMaintenanceDetail>>();
            }
        }
        

        public List<Entity.DeviceMaintenanceResponse> GetUpComingList(Entity.DeviceMaintenanceRequest request)
        {
            try
            {
                if (request.currentDate.HasValue)
                {
                    DateTime dateValue;
                    if (DateTime.TryParse(request.currentDate.Value.ToString(), out dateValue))
                    {
                        dateValue = dateValue.AddMinutes(-double.Parse(request.timeZone));// TimeZoneInfo.ConvertTimeBySystemTimeZoneId(dateValue, request.timeZone, "UTC");
                    }
                    request.currentDate = dateValue;
                }
                return _deviceMaintenanceRepository.GetUpComingList(request);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex);
                return new List<Entity.DeviceMaintenanceResponse>();
            }
        }
        public Entity.BaseResponse<Entity.DeviceSceduledMaintenanceResponse> GetDeviceScheduledMaintenance(Guid deviceId, DateTime currentDate, string timeZone)
        {
            try
            {
                return _deviceMaintenanceRepository.GetDeviceScheduledMaintenance(deviceId, currentDate, timeZone);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex);
                return new Entity.BaseResponse<Entity.DeviceSceduledMaintenanceResponse>();
            }
        }
    }
}
