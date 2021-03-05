using System;
using System.Collections.Generic;

namespace iot.solution.entity.Response
{
    public class EntityWiseDeviceResponse
    {
        public Guid Guid { get; set; }
        public string Name { get; set; }
        public string UniqueID { get; set; }
        public string Status { get; set; }
    }
}
