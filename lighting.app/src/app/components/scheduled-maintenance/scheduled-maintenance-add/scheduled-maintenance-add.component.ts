import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ScheduledMaintenanceService, NotificationService, Notification, LookupService } from '../../../services';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageAlertDataModel, AppConstant } from '../../../app.constants';
import { MatDialog } from '@angular/material';
import { MessageDialogComponent } from '../..';
import * as moment from 'moment'
import { upperCase } from '@rxweb/reactive-form-validators';


@Component({
  selector: 'app-scheduled-maintenance-add',
  templateUrl: './scheduled-maintenance-add.component.html',
  styleUrls: ['./scheduled-maintenance-add.component.css']
})
export class ScheduledMaintenanceAddComponent implements OnInit {

  moduleName = "Schedule Maintenance";
  maintenanceForm: FormGroup;
  maintenanceObject:any = {};
  buildingList = [];
  wingList = [];
  elevatorList = [];
  statusList = [{ "value": "Scheduled" }, { "value": "Under Maintenance" }, { "value": "Completed" }];
  buttonname = "Submit";
  checkSubmitStatus = false;
  isEdit = false;
  companyId: any;
  messageAlertDataModel: MessageAlertDataModel;
  guid: any;
  maintenanceGuid: any;
  isCompleted = false;
  today:any;
  public endDateValidate: any;

  constructor(private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private _service: ScheduledMaintenanceService,
    private _notificationService: NotificationService,
    private router: Router,
    public _appConstant: AppConstant,
    public dialog: MatDialog,
    private lookupService: LookupService,
    private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe(params => {
      if (params.guid) {
        this.maintenanceGuid = params.guid;
        this.getScheduledMaintenanceDetails(params.guid);
        this.guid = params.buildingGuid;
        this.moduleName = "Edit Scheduled Maintenance";
        this.isEdit = true;
        this.buttonname = 'Update'
      } else {
        this.maintenanceObject = {}
      }
    });
    this.createFormGroup();
  }

  ngOnInit() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companyId = currentUser.userDetail.companyId;
    this.getBuildingList(this.companyId);
    this.today = new Date();
    let  dd = this.today.getDate();
    let mm = this.today.getMonth()+1; //January is 0!
    let yyyy = this.today.getFullYear();
    if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 

    this.today = yyyy+'-'+mm+'-'+dd;
    this.endDateValidate = yyyy + '-' + mm + '-' + dd;
  }

  /**
   * Create form on page load
   * */
  createFormGroup() {
    this.maintenanceForm = this.formBuilder.group({
      entityGuid: new FormControl({ value: '', disabled: this.isEdit }, [Validators.required]),
      buildingGuid: new FormControl({ value: '', disabled: this.isEdit }, [Validators.required]),
      deviceGuid: new FormControl({ value: '', disabled: this.isEdit }, [Validators.required]),
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
     // status: ['', Validators.required],
      description: ['']
    });
  }

  /**
   * Schedule Maintenance
   * */
  scheduleMaintenance() {
    this.checkSubmitStatus = true;

    if (this.isEdit) {
      this.maintenanceForm.registerControl('guid', new FormControl(this.maintenanceGuid))
    }
    if (this.maintenanceForm.status === "VALID") {

      this.spinner.show();
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      var data={...this.maintenanceForm.value};
      if (this.isEdit){
        data.description=this.maintenanceForm.get('description').value;
        data.guid=this.maintenanceGuid;
      }
       data.startDateTime = moment(data.startDateTime).format('YYYY-MM-DDTHH:mm:ss');
        data.endDateTime = moment(data.endDateTime).format('YYYY-MM-DDTHH:mm:ss');
      data.timeZone = moment().utcOffset();
        this._service.scheduleMaintenance(data).subscribe(response => {
        if (response.isSuccess === true) {
          this.spinner.hide();
          if (this.isEdit) {
            this._notificationService.add(new Notification('success', "Maintenance updated successfully."));
          } else {
            this._notificationService.add(new Notification('success', "Maintenance created successfully."));
          }
          this.router.navigate(['/maintenance']);
        } else {
          this.spinner.hide();
          this._notificationService.add(new Notification('error', response.message));
        }
      });
    }
  }

  
  getTimeZone() {
    return /\((.*)\)/.exec(new Date().toString())[1];
  }

    /**
   * validate end date using start date change
   * @param startdate
   */
  onChangeStartDate(startdate) {
    let date = moment(startdate).add(this._appConstant.minGap, 'm').format();
    this.endDateValidate = new Date(date);
  }

  /**
   * Get building lookup by companyId
   * @param companyId
   */
  getBuildingList(companyId) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.lookupService.getsensor(currentUser.userDetail.companyId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.buildingList = response.data;
          this.buildingList = this.buildingList.filter(word => word.isActive == true);
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
   * Get wing lookup by buildingId
   * @param buildingId
   */
  getWingList(buildingId) {
    this.spinner.show();
    this.lookupService.getZonelookup(buildingId).subscribe(response => {
      this.spinner.hide();
      this.wingList = response.data;
    });
  }

  /**
   * Get elevator lookup by wingId
   * @param wingId
   */
  getElevatorList(wingId) {
    this.spinner.show();
    this._service.getElevatorLookup(wingId).subscribe(response => {
      this.spinner.hide();
      this.elevatorList = response.data;
    });
  }

  /**
   * Get schedule maintenance details by guid
   * @param guid
   */
  getScheduledMaintenanceDetails(guid) {
    this.spinner.show();
    this._service.getScheduledMaintenanceDetails(guid).subscribe(response => {
      if (response.isSuccess === true && response.data != '') {
        let buildingGuid = response.data.buildingGuid.toUpperCase();
        response.data.buildingGuid = buildingGuid;
        let entityGuid = response.data.entityGuid.toUpperCase();
        response.data.entityGuid = entityGuid;
        let deviceGuid = response.data.deviceGuid.toUpperCase();
        response.data.deviceGuid = deviceGuid;
        this.maintenanceObject = response.data;
        this.maintenanceObject.startDateTime = moment(this.maintenanceObject.startDateTime+'Z').local();
        this.maintenanceObject.endDateTime = moment(this.maintenanceObject.endDateTime+'Z').local();
        this.getBuildingList(this.maintenanceObject['companyGuid']);
        this.getWingList(this.maintenanceObject['buildingGuid']);
        this.getElevatorList(this.maintenanceObject['entityGuid']);
        this.spinner.hide();
      }
    });
  }
}
