namespace iot.solution.entity.Response
{
    public class DeviceSettingDetailResponse:Device
    {
       public bool PresenceFlag { get; set; }
        public bool IntensityFlag { get; set; }
        public bool ScheduledFlag { get; set; }
    }

   
}
