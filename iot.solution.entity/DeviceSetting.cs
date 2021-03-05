using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace iot.solution.entity
{
    public class DeviceSetting
    {
        public Guid guid { get; set; }
        public Guid deviceGuid { get; set; }
        public TimeSpan? amTime { get; set; }
        public string amTimeValue { get; set; }
        public TimeSpan? pmTime { get; set; }
        public string pmTimeValue { get; set; }
        public long? presenceTime { get; set; }
        public int? intensityOn { get; set; }
        public int? intensityOff { get; set; }
        public int? dimming { get; set; }
        public bool? isActive { get; set; }
        public bool isDeleted { get; set; }
        public Guid? createdBy { get; set; }
        public DateTime? createdDate { get; set; }
        public Guid? updatedBy { get; set; }
        public DateTime? updatedDate { get; set; }
    }
   
}
