using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace iot.solution.entity
{
    public class DeviceMaintenance
    {
        public Guid Guid { get; set; }
        public Guid CompanyGuid { get; set; }
        //This is wing Guid
        public Guid? EntityGuid { get; set; }
        public Guid? BuildingGuid { get; set; }
        public Guid DeviceGuid { get; set; }
        public string Description { get; set; }
         
        public DateTime? CreatedDate { get; set; }
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public bool IsDeleted { get; set; }
        public string TimeZone { get; set; }
    }
    public class DeviceMaintenanceDetail : DeviceMaintenance
    {
        public string Name { get; set; }
        public string Building { get; set; }
        public string Zone { get; set; }
        public string Status { get; set; }

    }

    public class DeviceMaintenanceResponse
    {
        public string Building { get; set; }
        public string Zone{ get; set; }
        public string DeviceName { get; set; }
        public string Description { get; set; }
        public DateTime ScheduledDate { get; set; }
    }

    public class DeviceMaintenanceRequest
    {
        public Guid? BuildingGuid { get; set; }
        public Guid? DeviceGuid { get; set; }
        public DateTime? currentDate { get; set; }
        public string timeZone { get; set; }
    }
    public class DeviceSceduledMaintenanceResponse
    {
        public string UniqueId { get; set; }
        public string Day { get; set; }
        public string Hour { get; set; }
        public string Minute { get; set; }
        public DateTime startDate { get; set; }
    }
}
