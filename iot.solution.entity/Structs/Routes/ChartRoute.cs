using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity.Structs.Routes
{
    public class ChartRoute
    {
        public struct Name
        {
            public const string GetEnergyUsageByCompany = "chart.getenergyusagebycompany";
            public const string GetStatisticsByEntity = "chart.getstatisticsbyentity";
            public const string GetStatisticsByDevice = "chart.getstatisticsbydevice";
            public const string GetPhotoElectricSensorByDevice = "chart.GetPhotoElectricSensorByDevice";
            public const string GetLightIntensityByDevice = "chart.GetLightIntensityByDevice";
            public const string ExecuteCrone = "chart.executecrone";

        }

        public struct Route
        {
            public const string Global = "api/chart";
            public const string GetEnergyUsageByCompany = "getenergyusagebycompany";
            public const string GetStatisticsByEntity = "getstatisticsbyentity";
            public const string GetStatisticsByDevice = "getstatisticsbydevice";
            public const string GetPhotoElectricSensorByDevice = "getphotoelectricsensorbydevice";            
            public const string GetLightIntensityByDevice = "getlightintensitybydevice";
            public const string ExecuteCrone = "executecron";
        }
    }
}
