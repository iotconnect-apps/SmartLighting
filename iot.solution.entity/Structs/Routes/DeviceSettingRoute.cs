using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity.Structs.Routes
{
    public class DeviceSettingRoute
    {
        public struct Name
        {
            public const string Add = "devicesetting.add";
            public const string GetList = "devicesetting.list";
            
            public const string GetById = "devicesetting.getbyid";
          
        }

        public struct Route
        {
            public const string Global = "api/devicesetting";
            public const string Manage = "manage";
            
            
            public const string GetById = "{deviceId}";
            
        }
    }
}
