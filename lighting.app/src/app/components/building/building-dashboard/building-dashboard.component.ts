import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
//import * as Highcharts from 'highcharts';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BuildingService, DashboardService, Notification, NotificationService, LookupService, AlertsService } from '../../../services';
import { MatDialog } from '@angular/material';
import { AppConstant, DeleteAlertDataModel, MessageAlertDataModel } from '../../../app.constants';
import { Location } from '@angular/common';
import { DeleteDialogComponent, MessageDialogComponent } from '../..';
import * as moment from 'moment-timezone'
import * as _ from 'lodash'
@Component({
  selector: 'app-building-dashboard',
  templateUrl: './building-dashboard.component.html',
  styleUrls: ['./building-dashboard.component.css'],
  providers: []
})
export class BuildingDashboardComponent implements OnInit {
  @ViewChild('myFile', { static: false }) myFile: ElementRef;
  lastSyncDate = '';
  isOpenFilterGraph: boolean = false;
  handleImgInput = false;
  validstatus = false;
  MesageAlertDataModel: MessageAlertDataModel;
  lineChartData = {
    chartType: 'LineChart',
    dataTable: [],
    options: {
      title: "",
      height: 350,
      interpolateNulls: true,
      hAxis: {
        title: 'Months',
        gridlines: {
          count: 5
        },
      },
      vAxis: {
        title: 'KW',
        gridlines: {
          count: 5
        },
      },
      legend: 'none',
      chartArea: { width: '85%', height: '85%' }
    },
  }
  searchParametersdata = {
    pageNumber: 0,
    pageNo: 0,
    pageSize: 10,
    searchText: '',
    sortBy: 'uniqueId asc'
  };

  searchParameters = {
    parentEntityGuid: '',
    pageNumber: 0,
    pageSize: -1,
    searchText: '',
    sortBy: 'name asc'
  };
  devicenames: any;
  fileName: any;
  fileToUpload: any;
  fileUrl: any;
  dataobj = {};
  zoneObject = {};
  buildingObj = {};
  zoneObj: any = {};
  isEdit = false;
  zoneModuleName = "";
  buttonname = "Submit";
  zoneForm: FormGroup;
  buildingGuid: any;
  checkSubmitStatus = false;
  isConnected = false;
  zoneList: any = [];
  lightList: any = [];
  sensorList: any = [];
  typeList: any = [];
  buildingList: any = [];
  zoneTypeList: any = [];
  zoneDataList: any = [];
  attrdatadetail: any = [];
  zoneGuid: any;
  mediaUrl = "";

  deleteAlertDataModel: DeleteAlertDataModel;
  public respondShow: boolean = false;
  devicename: any;
  datazone: any;
  dataType: any;
  buildingName: any;
  zoneName: any;
  attname: any;
  public canvasWidth = 250
  public needleValue = 0
  public centralLabel = ''
  public name = 'AQI'
  public bottomLabel = ' '
  public optionsdata = {
    hasNeedle: false,
    needleColor: 'gray',
    needleUpdateSpeed: 1000,
    arcColors: ['', ''],
    arcDelimiters: [50],
    rangeLabel: ['0', '100'],
    needleStartValue: 0,
  }
  sensid: any;
  zoneId: any;
  sensorNamedata: any;
  textlabel: any;
  ishow: boolean;
  @ViewChild('imageupload', null) imageUpload: ElementRef;
  MessageAlertDataModel: MessageAlertDataModel;
  selectedZoneType: any = 'Indoor';
  isSearch: boolean;
  buildingId: any;
  currentImage: any;
  Respond() {
    this.getZoneTypeList();
    this.currentImage = '';
    this.respondShow = !this.respondShow;
    this.fileToUpload = null;
    this.checkSubmitStatus = false;
    this.zoneForm.reset();
    this.zoneObj = {};
    this.fileName = '';
    this.refresh();
  }
  alerts = [];
  closerepond() {
    this.currentImage = '';
    this.checkSubmitStatus = false;
    this.respondShow = false;
    this.isEdit = false;
    this.fileToUpload = null;
    this.zoneForm.reset();
    this.zoneObj.image = '';
    this.fileName = '';
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public _appConstant: AppConstant,
    public dashboardService: DashboardService,
    private _notificationService: NotificationService,
    private lookupService: LookupService,
    public alertsService: AlertsService,
    public buildingService: BuildingService,
    public location: Location,

  ) {
    this.createFormGroup();
    this.dataobj = { guid: '', zoneguid: '' }
    this.activatedRoute.params.subscribe(params => {
      if (params.buildingGuid) {
        this.buildingGuid = params.buildingGuid
        this.buildingId = params.buildingGuid
      }

    })
  }

  ngOnInit() {
    this.ishow = false;
    this.getbuildingDetails(this.buildingGuid)
    this.getZoneList(this.buildingGuid)
    this.mediaUrl = this._notificationService.apiBaseUrl;
    this.getBuildingLookup();
    this.getZoneTypeLookup();
  }
  /**
   * Remove Image Zone 
   * */
  imageRemove() {
    this.myFile.nativeElement.value = "";
    if (this.zoneObj['image'] == this.currentImage) {
      this.zoneForm.get('imageFile').setValue('');
      if (!this.handleImgInput) {
        this.handleImgInput = false;
        this.deleteImgModel();
      }
      else {
        this.handleImgInput = false;
      }
    }
    else {
      if (this.currentImage) {
        this.spinner.hide();
        this.zoneObj['image'] = this.currentImage;
        this.fileToUpload = false;
        this.fileName = '';
        this.fileUrl = null;
      }
      else {
        this.spinner.hide();
        this.zoneObj['image'] = null;
        this.zoneForm.get('imageFile').setValue('');
        this.fileToUpload = false;
        this.fileName = '';
        this.fileUrl = null;
      }
    }
  }


  /**
   * Delete Zone Image   
   * */
  deleteZoneImg() {
    this.spinner.show();
    this.alertsService.removeImage(this.zoneObj.guid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.currentImage = '';
        this.zoneObj['image'] = null;
        this.zoneForm.get('imageFile').setValue(null);
        this.fileToUpload = false;
        this.fileName = '';
        this.getZoneList(this.buildingGuid);
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Zone Image")));
      } else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  /**
   * Delete Image Model 
   * */
  deleteImgModel() {
    this.deleteAlertDataModel = {
      title: "Delete Image",
      message: this._appConstant.msgConfirm.replace('modulename', "Zone Image"),
      okButtonName: "Yes",
      cancelButtonName: "No",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteZoneImg();
      }
    });
  }

  /**
   * Get Alert List 
   * */
  getAlertList() {
    this.alerts = [];
    let parameters = {
      pageNo: 0,
      pageSize: 10,
      searchText: '',
      orderBy: 'eventDate desc',
      deviceGuid: '',
      entityGuid: this.zoneId,
    };
    this.spinner.show();
    this.alertsService.getAlerts(parameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        if (response.data.count) {
          this.alerts = response.data.items;
        }

      }
      else {
        this.alerts = [];
        this._notificationService.add(new Notification('error', response.message));

      }
    }, error => {
      this.alerts = [];

      this._notificationService.add(new Notification('error', error));
    });
  }
  /**
 * Set Form field on load Page
 * */
  createFormGroup() {
    this.zoneForm = new FormGroup({
      parentEntityGuid: new FormControl(null),
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      type: new FormControl('', [Validators.required]),
      isactive: new FormControl(''),
      imageFile: new FormControl(''),
    });
  }

  highcharts;

  chartOptions = {};
  /**
   * Get Building Detail 
   * @param buildingGuid
   * */
  getbuildingDetails(buildingGuid) {
    this.spinner.show();
    this.buildingService.getBuildingDetails(buildingGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.buildingObj = response.data;
        let building = response.data.guid.toUpperCase();
        response.data.guid = building;
        this.buildingName = response.data.name;
        this.buildingId = response.data.guid;
        this.dataobj = response.data;
      }
      else {
        if (response.message) {
          this._notificationService.add(new Notification('error', response.message));
        }
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  /**
   * Get Zone List by buildingGuid
   * @param buildingGuid
   * */
  getZoneList(buildingGuid) {
    this.spinner.show();
    this.searchParameters['parentEntityGuid'] = buildingGuid;
    this.buildingService.getBuilding(this.searchParameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.zoneList = response.data.items;
      }
      else {
        if (response.message) {
          this._notificationService.add(new Notification('error', response.message));
        }
        this.zoneList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  /**
   * refresh Form Group
   * */
  refresh() {
    this.createFormGroup();
    this.zoneForm.reset(this.zoneForm.value);
    this.zoneModuleName = "Add Zone";
    this.zoneId = null;
    this.buttonname = 'Add';
    this.respondShow = true;
    this.isEdit = false;
  }
  /**
   * Get Zone Detail 
   * @param zoneGuid
   * */
  getZoneDetails(zoneGuid) {
    this.zoneModuleName = "Edit Zone";
    this.fileName = '';
    this.currentImage = '';
    this.fileToUpload = false;
    this.zoneObj.image = '';
    this.zoneGuid = zoneGuid;
    this.isEdit = true;
    this.buttonname = 'Update';
    this.respondShow = true;
    this.spinner.show();
    this.buildingService.getBuildingDetails(zoneGuid).subscribe(response => {
      this.spinner.hide();
      this.buildingObj = response.data;
      if (response.isSuccess === true) {
        this.getZoneTypeList();
        this.zoneObj = response.data;
        if (this.zoneObj.image) {
          this.zoneObj.image = this.mediaUrl + this.zoneObj.image;
          this.currentImage = this.zoneObj.image;
        }
      }
      else {
        if (response.message) {
          this._notificationService.add(new Notification('error', response.message));
        }
        this.zoneList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  /**
   * Add Zone 
   * */
  manageZone() {
    this.checkSubmitStatus = true;
    var data = {
      "parentEntityGuid": this.buildingGuid,
      "name": this.zoneForm.value.name,
      "description": this.zoneForm.value.description,
      "isactive": true,
      "countryGuid": this.buildingObj['countryGuid'],
      "stateGuid": this.buildingObj['stateGuid'],
      "city": this.buildingObj['city'],
      "zipcode": this.buildingObj['zipcode'],
      "address": this.buildingObj['address'],
      "latitude": this.buildingObj['latitude'],
      "longitude": this.buildingObj['longitude'],
      "type": this.zoneForm.value.type,
    }
    if (this.isEdit) {
      if (this.zoneGuid) {
        data["guid"] = this.zoneGuid;
      }
      if (this.fileToUpload) {
        data["imageFile"] = this.fileToUpload;
      }
      data.isactive = this.zoneObject['isactive']
    }
    else {
      data["imageFile"] = this.fileToUpload;

      this.zoneForm.get('isactive').setValue(true);

    }
    if (this.zoneForm.status === "VALID") {
      if (this.validstatus == true || !this.zoneForm.value.imageFile) {
        this.spinner.show();
        this.buildingService.addzone(data).subscribe(response => {
          this.spinner.hide();

          if (response.isSuccess === true) {
            this.respondShow = false;
            if (this.isEdit) {
              this._notificationService.add(new Notification('success', "Zone updated successfully."));
              this.closerepond();
            } else {
              this._notificationService.add(new Notification('success', "Zone created successfully."));
              this.closerepond();
            }
            this.getZoneList(this.buildingGuid);
          } else {
            if (response.message) {
              this._notificationService.add(new Notification('error', response.message));
            }
          }
        });
      } else {
        this.MesageAlertDataModel = {
          title: "Zone Image",
          message: "Invalid Image Type.",
          message2: "Upload .jpg, .jpeg, .png Image Only.",
          okButtonName: "OK",
        };
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: 'auto',
          data: this.MesageAlertDataModel,
          disableClose: false
        });
      }
    }
  }

  /**
   * Get Zone Type List 
   * */
  getZoneTypeList() {
    this.spinner.show();
    this.buildingService.getZoneTypelist().subscribe(response => {
      this.spinner.hide();
      this.typeList = response.data;
    });
  }

  /**
   * Get Zone Image Onchange 
   * @param event
   * */
  handleImageInput(event) {
    this.handleImgInput = true;
    let files = event.target.files;
    var that = this;
    if (files.length) {
      let fileType = files.item(0).name.split('.');
      let imagesTypes = ['jpeg', 'JPEG', 'jpg', 'JPG', 'png', 'PNG'];
      if (imagesTypes.indexOf(fileType[fileType.length - 1]) !== -1) {

        this.validstatus = true;
        this.fileName = files.item(0).name;
        this.fileToUpload = files.item(0);
        if (event.target.files && event.target.files[0]) {
          var reader = new FileReader();
          reader.readAsDataURL(event.target.files[0]);
          reader.onload = (innerEvent: any) => {
            this.fileUrl = innerEvent.target.result;
            that.zoneObj.image = this.fileUrl
          }
        }
      } else {
        this.imageRemove();
        this.imageUpload.nativeElement.value = null;
        this.zoneForm.get('imageFile').setValue('');
        this.fileToUpload = null;
        this.fileName = '';
        this.MessageAlertDataModel = {
          title: "Zone Image",
          message: "Invalid Image Type.",
          message2: "Upload .jpg, .jpeg, .png Image Only.",
          okButtonName: "OK",
        };
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: 'auto',
          data: this.MessageAlertDataModel,
          disableClose: false
        });

      }
    }

    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (innerEvent: any) => {
        this.fileUrl = innerEvent.target.result;
        that.zoneObj.image = this.fileUrl;
      }
    }
  }
  /**
   * Delete Popup
   * @param userModel
   * */
  deleteModel(userModel: any) {
    this.deleteAlertDataModel = {
      title: "Delete Zone",
      message: this._appConstant.msgConfirm.replace('modulename', "Zone"),
      okButtonName: "Yes",
      cancelButtonName: "No",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteZone(userModel.guid);
      }
    });
  }

  /**
   * Delete Zone By guid
   * @param guid
   * */
  deleteZone(guid) {
    this.spinner.show();
    this.buildingService.deleteBuilding(guid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Zone")));
        this.getZoneList(this.buildingGuid);

      }
      else {
        if (response.message) {
          this._notificationService.add(new Notification('error', response.message));
        }
      }

    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * Get Building Lookup 
   * */
  getBuildingLookup() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.lookupService.getsensor(currentUser.userDetail.companyId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.buildingList = response.data;
        } else {
          if (response.message) {

            this._notificationService.add(new Notification('error', response.message));
          }
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })

  }

  /**
   * Get Zone Type Lookup
   * */
  getZoneTypeLookup() {
    this.lookupService.getzonetype().
      subscribe(response => {
        if (response.isSuccess === true && response.data != '' && response.data != undefined) {
          this.zoneTypeList = response['data'];
          this.getTypedata(this.selectedZoneType);
        } else {
          if (response.message) {
            this._notificationService.add(new Notification('error', response.message));
          }
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })

  }

  /**
   * get Zone By parentEntityId
   * @param parentEntityId
   * */
  getZone(parentEntityId) {
    this.ishow = false;
    this.zoneDataList = [];
    this.sensorList = [];
    this.zoneName = '';
    this.buildingId = parentEntityId;
    let obj = this.buildingList.find(o => o.value === this.buildingId);
    if (obj && obj.text) {
      this.buildingName = obj.text;
      this.getZoneTypeLookup();
    }
  }

  /**
   * get Lights By ZoneId
   * @param zoneId
   * */
  getLights(zoneId) {
    this.ishow = true;
    this.sensorList = [];
    this.zoneId = zoneId;
    this.getLightList(zoneId);
    this.getAlertList()
    let type = 'd';
    this.getBuildingGraph(zoneId, type);
    let obj = this.zoneDataList.find(o => o.value === zoneId);
    this.zoneName = obj.text;

  }

  /**
   * get zone type
   * @param type
   * @param buildingId
   * */
  getTypedata(type) {
    this.lookupService.getzoneonType(type, this.buildingId).
      subscribe(response => {
        if (response.isSuccess === true && response.data != '' && response.data != null) {
          this.zoneDataList = response.data;
          if (this.zoneDataList) {
            this.datazone = this.zoneDataList[0].value;
            this.getLights(this.datazone);
          }
        } else {
          this.ishow = false;
          this.zoneDataList = [];
          this.sensorList = [];
          if (response.message) {

            this._notificationService.add(new Notification('error', response.message));
          }
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }
  /**
   * get local Date
   * @param lDate
   * */
  getLocalDate(lDate) {
    var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
    // Get the local version of that date
    var localDate = moment(utcDate).local();
    let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
    return res;

  }
  /**
   * Search by Text
   * @param filterText
   * */
  search(filterText) {
    this.searchParametersdata.searchText = filterText;
    this.searchParametersdata.pageNo = 0;
    this.getLightList(this.zoneId);
  }
  /**
   * Search by Text
   * @param filterText
   * */
  searchTextCallback(filterText) {
    this.searchParametersdata.searchText = filterText;
    this.searchParametersdata.pageNumber = 0;
    this.getLightList(this.zoneId);
    this.isSearch = true;
  }
  /**
   * Get Lights by zoneId
   * @param zoneId
   * */
  getLightList(zoneId) {
    this.lightList = [];
    this.spinner.show();
    this.dashboardService.getLightlist(this.searchParametersdata, zoneId).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.lightList = response.data.items

      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  /**
   * Get Graph by Change Event
   * @param event
   * */
  changeGraphFilter(event) {
    let type = 'd';
    if (event.value === 'Week') {
      type = 'w';
    } else if (event.value === 'Month') {
      type = 'm';
    }
    this.getBuildingGraph(this.zoneId, type);

  }
  /**
   * Get Graph by buildingId
   * @param buildingId
   * @param type
   * */
  getBuildingGraph(buildingId, type) {
    this.spinner.show();
    var data = { entityGuid: buildingId, frequency: type }
    this.dashboardService.getBuildingGraph(data).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.lastSyncDate = response.lastSyncDate;
        let data = [];
        if (response.data.length) {
          data.push(['Months', 'Consumption'])

          response.data.forEach(element => {
            data.push([element.name, parseFloat(element.energyConsumption)])
          });
        }
        this.lineChartData = {
          chartType: 'LineChart',
          dataTable: data,
          options: {
            title: "",
            height: 350,
            interpolateNulls: true,
            hAxis: {
              title: '',
              gridlines: {
                count: 5
              },
            },
            vAxis: {
              title: 'KW',
              gridlines: {
                count: 5
              },
            },
            legend: 'none',
            chartArea: { width: '85%', height: '85%' }
          },
        }
      }
      else {
        this.lineChartData.dataTable = [];
        this._notificationService.add(new Notification('error', response.message));

      }
    }, error => {
      this.lineChartData.dataTable = [];
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
}
