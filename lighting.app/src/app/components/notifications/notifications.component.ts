import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  displayedColumns: string[] = ['message', 'building', 'attachedPole', 'capacity', 'detectedVoltage', 'template', 'date', 'severity'];
  notificationsList = [
    { 
      message: 'High Voltage at Light ID AA01AO',
      building: 'Ahmedabad Building',
      attachedPole: '15',
      capacity: '200KW',
      detectedVoltage: '500KW',
      template: 'Phillips P1',
      date: '3/6/20, 9:42:12 AM',
      severity: 'Critical'
    },    
    { 
      message: 'High Voltage at Light ID AA01AO',
      building: 'Ahmedabad Building',
      attachedPole: '15',
      capacity: '200KW',
      detectedVoltage: '500KW',
      template: 'Phillips P1',
      date: '3/6/20, 9:42:12 AM',
      severity: 'Critical'
    },    
    { 
      message: 'High Voltage at Light ID AA01AO',
      building: 'Ahmedabad Building',
      attachedPole: '15',
      capacity: '200KW',
      detectedVoltage: '500KW',
      template: 'Phillips P1',
      date: '3/6/20, 9:42:12 AM',
      severity: 'Critical'
    },    
    { 
      message: 'High Voltage at Light ID AA01AO',
      building: 'Ahmedabad Building',
      attachedPole: '15',
      capacity: '200KW',
      detectedVoltage: '500KW',
      template: 'Phillips P1',
      date: '3/6/20, 9:42:12 AM',
      severity: 'Critical'
    },    
    { 
      message: 'High Voltage at Light ID AA01AO',
      building: 'Ahmedabad Building',
      attachedPole: '15',
      capacity: '200KW',
      detectedVoltage: '500KW',
      template: 'Phillips P1',
      date: '3/6/20, 9:42:12 AM',
      severity: 'Critical'
    },    
  ];
  buildings = [
    { value: 'ahmedabad-building', viewValue: 'Ahmedabad Building' },
    { value: 'rajkot-building', viewValue: 'Rajkot Building' },
    { value: 'vadodara-building', viewValue: 'Vadodara Building' }
  ];
  parkings = [
    { value: 'parking-zone1', viewValue: 'Parking Zone 1' },
    { value: 'parking-zone2', viewValue: 'Parking Zone 2' },
    { value: 'parking-zone3', viewValue: 'Parking Zone 3' }
  ];
  zoneTypes = [
    { value: 'outdoor', viewValue: 'Outdoor' },    
    { value: 'indoor', viewValue: 'Indoor' },    
  ];  
  isFilterShow: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  /**
 * Show hide filter
 */
  public showHideFilter() {
    this.isFilterShow = !this.isFilterShow;
  }

}
