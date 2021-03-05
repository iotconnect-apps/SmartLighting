using iot.solution.data;
using iot.solution.model.Repository.Interface;
using iot.solution.service.Interface;
using System.Collections.Generic;
using Request = iot.solution.entity.Request;
using Response = iot.solution.entity.Response;
using System.Data;
using System.Data.Common;
using System.Reflection;
using component.logger;
using System;
using Entity = iot.solution.entity;
using LogHandler = component.services.loghandler;
using System.Linq;
using component.helper.Interface;

namespace iot.solution.service.Implementation
{
    public class ChartService : IChartService
    {
        private readonly IEntityRepository _entityRepository;
        private readonly LogHandler.Logger _logger;
        private readonly IEmailHelper _emailHelper;
        public string ConnectionString = component.helper.SolutionConfiguration.Configuration.ConnectionString;
        //private readonly LogHandler.Logger _logger;
        public ChartService(IEntityRepository entityRepository, LogHandler.Logger logger, IEmailHelper emailHelper)//, LogHandler.Logger logger)
        {
            _entityRepository = entityRepository;
            _logger = logger;
            _emailHelper = emailHelper;
        }
        public Entity.ActionStatus TelemetrySummary_DayWise()
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                _logger.InfoLog(LogHandler.Constants.ACTION_ENTRY, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = new List<DbParameter>();
                    sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[TelemetrySummary_DayWise_Add]", CommandType.StoredProcedure, null), parameters.ToArray());
                }
                _logger.InfoLog(LogHandler.Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);

            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.ActionStatus TelemetrySummary_HourWise()
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                _logger.InfoLog(LogHandler.Constants.ACTION_ENTRY, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = new List<DbParameter>();
                    sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[TelemetrySummary_HourWise_Add]", CommandType.StoredProcedure, null), parameters.ToArray());
                }
                _logger.InfoLog(LogHandler.Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);

            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.BaseResponse<List<Response.EnergyUsageResponse>> GetEnergyUsageByCompany(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.EnergyUsageResponse>> result = new Entity.BaseResponse<List<Response.EnergyUsageResponse>>();
            try
            {
                _logger.InfoLog(Constants.ACTION_ENTRY, "Chart_StatisticsByEntity.Get");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", request.CompanyGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("frequency", request.Frequency, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("syncDate", DateTime.UtcNow, DbType.DateTime, ParameterDirection.Output));

                    // parameters.Add(sqlDataAccess.CreateParameter("attribute", request.Attribute, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Company_EnergyConsumption]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Data = DataUtils.DataReaderToList<Response.EnergyUsageResponse>(dbDataReader, null);
                    if (parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault() != null)
                    {
                        result.LastSyncDate = Convert.ToString(parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault().Value);
                    }
                }
                _logger.InfoLog(Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return result;
        }
        public Entity.BaseResponse<List<Response.EntityStatisticsResponse>> GetStatisticsByEntity(Request.ChartRequest request)
        {
            Entity.BaseResponse < List <Response.EntityStatisticsResponse>> result = new Entity.BaseResponse<List<Response.EntityStatisticsResponse>>();
            try
            {
                _logger.InfoLog(Constants.ACTION_ENTRY, "Chart_StatisticsByEntity.Get");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", request.EntityGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("frequency", request.Frequency, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("syncDate", DateTime.UtcNow, DbType.DateTime, ParameterDirection.Output));

                    // parameters.Add(sqlDataAccess.CreateParameter("attribute", request.Attribute, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Chart_EnergyConsumptionByEntity]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Data = DataUtils.DataReaderToList<Response.EntityStatisticsResponse>(dbDataReader, null);
                    if (parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault() != null)
                    {
                        result.LastSyncDate = Convert.ToString(parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault().Value);
                    }
                }
                _logger.InfoLog(Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return result;
        }
        public Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> GetStatisticsByDevice(Request.ChartRequest request)
        {
            Entity.BaseResponse < List <Response.DeviceStatisticsResponse>> result = new Entity.BaseResponse<List<Response.DeviceStatisticsResponse>>();
            try
            {
                _logger.InfoLog(Constants.ACTION_ENTRY, "Chart_StatisticsByDevice.Get");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", request.DeviceGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("frequency", request.Frequency, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("syncDate", DateTime.UtcNow, DbType.DateTime, ParameterDirection.Output));

                    // parameters.Add(sqlDataAccess.CreateParameter("attribute", request.Attribute, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Chart_EnergyConsumptionByDevice]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Data = DataUtils.DataReaderToList<Response.DeviceStatisticsResponse>(dbDataReader, null);
                    if (parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault() != null)
                    {
                        result.LastSyncDate = Convert.ToString(parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault().Value);
                    }
                }
                _logger.InfoLog(Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return result;
        }
        public Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> GetLightIntensityByDevice(Request.ChartRequest request)
        {
            Entity.BaseResponse < List <Response.DeviceStatisticsResponse>> result = new Entity.BaseResponse<List<Response.DeviceStatisticsResponse>>();
            try
            {
                _logger.InfoLog(Constants.ACTION_ENTRY, "Chart_StatisticsByDevice.Get");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", request.DeviceGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("frequency", request.Frequency, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("syncDate", DateTime.UtcNow, DbType.DateTime, ParameterDirection.Output));

                    // parameters.Add(sqlDataAccess.CreateParameter("attribute", request.Attribute, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Chart_LightIntensityByDevice]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Data = DataUtils.DataReaderToList<Response.DeviceStatisticsResponse>(dbDataReader, null);
                    if (parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault() != null)
                    {
                        result.LastSyncDate = Convert.ToString(parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault().Value);
                    }
                }
                _logger.InfoLog(Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return result;
        }
        public Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> GetPhotoElectricSensorByDevice(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> result = new Entity.BaseResponse<List<Response.DeviceStatisticsResponse>>();
            try
            {
                _logger.InfoLog(Constants.ACTION_ENTRY, "Chart_StatisticsByDevice.Get");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", request.DeviceGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("frequency", request.Frequency, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("syncDate", DateTime.UtcNow, DbType.DateTime, ParameterDirection.Output));

                    // parameters.Add(sqlDataAccess.CreateParameter("attribute", request.Attribute, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Chart_PhotoElectricSensorByDevice]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Data = DataUtils.DataReaderToList<Response.DeviceStatisticsResponse>(dbDataReader, null);
                    if (parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault() != null)
                    {
                        result.LastSyncDate = Convert.ToString(parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault().Value);
                    }
                }
                _logger.InfoLog(Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return result;
        }
        public Entity.ActionStatus SendSubscriptionNotification()
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                _logger.InfoLog(LogHandler.Constants.ACTION_ENTRY, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = new List<DbParameter>();
                    System.Data.Common.DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Get_UserSubscriptionEndData]", CommandType.StoredProcedure, null), parameters.ToArray());
                    var result = DataUtils.DataReaderToList<Response.SubscriptionEndData>(dbDataReader, null);
                    foreach (var item in result)
                    {
                        _emailHelper.SendSubscriptionOverEmail(item.CustomerName, item.ExpiryDate.ToString("dd MMM yyy"), item.Email);
                    }
                }
                _logger.InfoLog(LogHandler.Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);

            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
    }
}
