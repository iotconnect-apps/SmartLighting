using component.logger;
using iot.solution.data;
using iot.solution.entity;
using iot.solution.model.Repository.Interface;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.IO;
using System.Linq;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;
using Response = iot.solution.entity.Response;
using LogHandler = component.services.loghandler;
namespace iot.solution.model.Repository.Implementation
{
    public class DeviceSettingRepository : GenericRepository<Model.DeviceSetting>, IDeviceSettingRepository
    {
        private readonly LogHandler.Logger logger;
        private readonly IWebHostEnvironment _env;
        public DeviceSettingRepository(IUnitOfWork unitOfWork, LogHandler.Logger logManager,IWebHostEnvironment env) : base(unitOfWork, logManager)
        {
            logger = logManager;
            _uow = unitOfWork;
            _env = env;
        }

        public Entity.BaseResponse<Entity.DeviceSetting> Get(Guid deviceGuid)
        {
            var result = new Entity.BaseResponse<Entity.DeviceSetting>();
            try
            {
                logger.InfoLog(Constants.ACTION_ENTRY, "DeviceSettingRepository.Get");
                
                try
                {
                    
                    using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                    {
                        List<System.Data.Common.DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                        //parameters.Add(sqlDataAccess.CreateParameter("companyguid", component.helper.SolutionConfiguration.CompanyId, DbType.Guid, ParameterDirection.Input));
                        if (deviceGuid != Guid.Empty)
                        {
                            parameters.Add(sqlDataAccess.CreateParameter("deviceGuid", deviceGuid, DbType.Guid, ParameterDirection.Input));
                        }
                      
                        
                        System.Data.Common.DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[DeviceSetting_Get]", CommandType.StoredProcedure, null), parameters.ToArray());
                        var data = DataUtils.DataReaderToList<Entity.DeviceSetting>(dbDataReader, null);
                        int outPut = int.Parse(parameters.Where(p => p.ParameterName.Equals("output")).FirstOrDefault().Value.ToString());
                        if (outPut > 0)
                        {
                            
                            if (data.Count > 0)
                            {
                                result.IsSuccess = true;
                                result.Data = data[0];
                                result.Data.deviceGuid = data[0].guid;
                                result.Data.amTimeValue = data[0].amTime.HasValue ? data[0].amTime.Value.Hours.ToString("D2") + ":" + data[0].amTime.Value.Minutes.ToString("D2") : null;
                                result.Data.pmTimeValue = data[0].pmTime.HasValue ? data[0].pmTime.Value.Hours.ToString("D2") + ":" + data[0].pmTime.Value.Minutes.ToString("D2") : null;
                            }
                            else {
                                result.IsSuccess = false;
                                result.Message = "No settings found.";
                            }
                        }
                        else
                        {
                            result.IsSuccess = false;
                        }
                        
                              string msg = parameters.Where(p => p.ParameterName.Equals("fieldname")).FirstOrDefault().Value.ToString();
                        if (msg == "DeviceNotFound")
                        {
                            result.Message = "Device not found";
                        }
                        else
                        {
                            result.Message = msg;
                        }
                    }
                    logger.InfoLog(Constants.ACTION_EXIT, "DeviceSettingRepository.List");
                }
                catch (Exception ex)
                {
                    logger.ErrorLog(Constants.ACTION_EXCEPTION, ex);
                }
                return result;
                
            }
            catch (Exception ex)
            {
                logger.ErrorLog(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
       
        public Entity.ActionStatus Manage(Model.DeviceSetting request)
        {
            ActionStatus result = new ActionStatus(true);
            try
            {
                logger.InfoLog(Constants.ACTION_ENTRY, "DeviceSettingRepository.Manage");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {

                     List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                   // parameters.Add(sqlDataAccess.CreateParameter("guid", request.Guid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("DeviceGuid", request.DeviceGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("amTime", request.AmTime,  ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("pmTime", request.PmTime,  ParameterDirection.Input));
                   
                    parameters.Add(sqlDataAccess.CreateParameter("IntensityOff", request.IntensityOff, DbType.Int64, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("IntensityOn", request.IntensityOn, DbType.Int64, ParameterDirection.Input));
                                                           
                    parameters.Add(sqlDataAccess.CreateParameter("PresenceTime", request.PresenceTime, DbType.Int64, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("Dimming", request.Dimming, DbType.Int32, ParameterDirection.Input));

                    parameters.Add(sqlDataAccess.CreateParameter("newid", request.Guid, DbType.Guid, ParameterDirection.Output));
                    parameters.Add(sqlDataAccess.CreateParameter("culture", component.helper.SolutionConfiguration.Culture, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    int intResult = sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[DeviceSetting_AddUpdate]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Data = Guid.Parse(parameters.Where(p => p.ParameterName.Equals("newid")).FirstOrDefault().Value.ToString());                    
                }
                logger.InfoLog(Constants.ACTION_EXIT, "DeviceSettingRepository.Manage");
            }
            catch (Exception ex)
            {
                logger.ErrorLog(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
      
        


     
    }
}
