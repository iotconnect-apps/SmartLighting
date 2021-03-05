using iot.solution.entity.Structs.Routes;
using iot.solution.service.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using Entity = iot.solution.entity;
using Response = iot.solution.entity.Response;
using Request = iot.solution.entity.Request;

namespace host.iot.solution.Controllers
{
    [Route(ChartRoute.Route.Global)]
    [ApiController]
    public class ChartController : BaseController
    {
        private readonly IChartService _chartService;
        
        public ChartController(IChartService chartService)
        {
            _chartService = chartService;
        }
        [HttpPost]
        [Route(ChartRoute.Route.GetEnergyUsageByCompany, Name = ChartRoute.Name.GetEnergyUsageByCompany)]
        public Entity.BaseResponse<List<Response.EnergyUsageResponse>> EnergyUsageByCompany(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.EnergyUsageResponse>> response = new Entity.BaseResponse<List<Response.EnergyUsageResponse>>(true);
            try
            {
                response = _chartService.GetEnergyUsageByCompany(request);
                response.IsSuccess = true;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Response.EnergyUsageResponse>>(false, ex.Message);
            }
            return response;
        }
        [HttpPost]
        [Route(ChartRoute.Route.GetStatisticsByEntity, Name = ChartRoute.Name.GetStatisticsByEntity)]
        public Entity.BaseResponse<List<Response.EntityStatisticsResponse>> StatisticsByEntity(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.EntityStatisticsResponse>> response = new Entity.BaseResponse<List<Response.EntityStatisticsResponse>>(true);
            try
            {
                response = _chartService.GetStatisticsByEntity(request);
                response.IsSuccess = true;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Response.EntityStatisticsResponse>>(false, ex.Message);
            }
            return response;
        }
        [HttpPost]
        [Route(ChartRoute.Route.GetStatisticsByDevice, Name = ChartRoute.Name.GetStatisticsByDevice)]
        public Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> StatisticsByDevice(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> response = new Entity.BaseResponse<List<Response.DeviceStatisticsResponse>>(true);
            try
            {
                response = _chartService.GetStatisticsByDevice(request);
                response.IsSuccess = true;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Response.DeviceStatisticsResponse>>(false, ex.Message);
            }
            return response;
        }
        [HttpPost]
        [Route(ChartRoute.Route.GetLightIntensityByDevice, Name = ChartRoute.Name.GetLightIntensityByDevice)]
        public Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> LightIntensityByDevice(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> response = new Entity.BaseResponse<List<Response.DeviceStatisticsResponse>>(true);
            try
            {
                response = _chartService.GetLightIntensityByDevice(request);
                response.IsSuccess = true;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Response.DeviceStatisticsResponse>>(false, ex.Message);
            }
            return response;
        }
        [HttpPost]
        [Route(ChartRoute.Route.GetPhotoElectricSensorByDevice, Name = ChartRoute.Name.GetPhotoElectricSensorByDevice)]
        public Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> PhotoElectricSensorByDevice(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> response = new Entity.BaseResponse<List<Response.DeviceStatisticsResponse>>(true);
            try
            {
                response = _chartService.GetPhotoElectricSensorByDevice(request);
                response.IsSuccess = true;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Response.DeviceStatisticsResponse>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route(ChartRoute.Route.ExecuteCrone, Name = ChartRoute.Name.ExecuteCrone)]
        public Entity.BaseResponse<bool> ExecuteCrone()
        {
            Entity.BaseResponse<bool> response = new Entity.BaseResponse<bool>(true);
            try
            {
                var res = _chartService.TelemetrySummary_HourWise();
                var dayRes = _chartService.TelemetrySummary_DayWise();
                response.IsSuccess = res.Success;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<bool>(false, ex.Message);
            }
            return response;
        }

    }
}