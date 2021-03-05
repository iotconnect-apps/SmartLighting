using System;
using System.Collections.Generic;

namespace iot.solution.model.Models
{
    
    public partial class DeviceDetail : Device
    {
        public string EntityName { get; set; }
        public string SubEntityName { get; set; }
        public string ZoneType { get; set; }
        public string Status { get; set; }
    }

}
