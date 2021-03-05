using System;
using System.Collections.Generic;

namespace iot.solution.entity.Response
{
    public class DeviceUsageResponse
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }
    public class EnergyUsageResponse
    {
        public string Building { get; set; }
        public string Zone { get; set; }

        public string Energy { get; set; }
    }
    public class DeviceStatisticsResponse
    {
        public string Name { get; set; }
        public string EnergyConsumption { get; set; }
        
        public string UniqueId { get; set; }
    }
    public class EntityStatisticsResponse
    {
        public string Name { get; set; }
        public string EnergyConsumption { get; set; }

        public string entityGuid { get; set; }
    }
    public class FuelUsageResponse
    {
        public string Month { get; set; }
        public string Value { get; set; }
    }

    public class DeviceBatteryStatusResponse
    {
        public string Name { get; set; }
        public string Value { get; set; }
   
    }

    public class ConfgurationResponse
    {
        public string cpId { get; set; }
        public string host { get; set; }
        public int isSecure { get; set; }
        public string password { get; set; }
        public int port { get; set; }
        public string url { get; set; }
        public string user { get; set; }
        public string vhost { get; set; }
    }
}
