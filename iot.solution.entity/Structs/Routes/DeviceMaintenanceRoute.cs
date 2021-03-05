using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity.Structs.Routes
{
    public class DeviceMaintenanceRoute
    {
        public struct Name
        {
            public const string Add = "devicemaintenance.add";
            public const string GetList = "devicemaintenance.list";
            
            public const string GetById = "devicemaintenance.getbyid";
            public const string Delete = "devicemaintenance.delete";
            public const string BySearch = "devicemaintenance.search";
            public const string UpdateStatus = "devicemaintenance.updatestatus";
            public const string UpComingList = "devicemaintenance.upcoming";
            public const string GetScheduledMaintenenceDate = "Devicemaintenance.getscheduledMaintenancedate";
        }

        public struct Route
        {
            public const string Global = "api/devicemaintenance";
            public const string Manage = "manage";
            public const string GetList = "";
            public const string UpComingList = "upcoming";
            
            public const string GetById = "{id}";
            public const string Delete = "delete/{id}";
            public const string UpdateStatus = "updatestatus/{id}/{status}";
            public const string BySearch = "search";
            public const string GetScheduledMaintenenceDate = "getscheduledMaintenancedate/{deviceId}";
        }
    }
}
