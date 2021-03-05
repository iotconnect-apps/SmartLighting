using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Request = iot.solution.entity.Request;
using Response = iot.solution.entity.Response;

namespace iot.solution.service.Interface
{
    public interface IChartService
    {
        Entity.ActionStatus TelemetrySummary_DayWise();
        Entity.ActionStatus TelemetrySummary_HourWise();

        Entity.BaseResponse<List<Response.EnergyUsageResponse>> GetEnergyUsageByCompany(Request.ChartRequest request);
        Entity.BaseResponse<List<Response.EntityStatisticsResponse>> GetStatisticsByEntity(Request.ChartRequest request);
        Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> GetStatisticsByDevice(Request.ChartRequest request);
        Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> GetLightIntensityByDevice(Request.ChartRequest request);
        Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> GetPhotoElectricSensorByDevice(Request.ChartRequest request);
        Entity.ActionStatus SendSubscriptionNotification();
    }
}
