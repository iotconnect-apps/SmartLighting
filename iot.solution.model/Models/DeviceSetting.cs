﻿using System;
using System.Collections.Generic;

namespace iot.solution.model.Models
{
    public partial class DeviceSetting
    {
        public Guid Guid { get; set; }
        public Guid DeviceGuid { get; set; }
        public TimeSpan? AmTime { get; set; }
        public TimeSpan? PmTime { get; set; }
        public long? PresenceTime { get; set; }
        public int? IntensityOn { get; set; }
        public int? IntensityOff { get; set; }
        public int? Dimming { get; set; }
        public bool? IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
