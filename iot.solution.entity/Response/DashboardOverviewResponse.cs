namespace iot.solution.entity
{
    
    public class DashboardOverviewResponse
    {
        public int TotalEntities { get; set; }
        public int TotalDevices { get; set; }
        public int ConnectedDeviceCount { get; set; }
        public int DisconnectedDeviceCount { get; set; }
        public int TotalRunning{ get; set; }
        public int TotalUnderMaintenanceCount { get; set; }
        public int EnergyCount { get; set; }
        public int TotalAlerts { get; set; }
        public int TotalHighVolt { get; set; }
        public int TotalInterComError { get; set; }
        public int TotalLowVolt { get; set; }
        public int TotalPannelOff { get; set; }
        public int TotalStrikeFail { get; set; }
        public int ActiveUserCount { get; set; }
        public int InactiveUserCount { get; set; }
        public int TotalUserCount { get; set; }
    }
}
