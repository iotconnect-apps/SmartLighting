import * as moment from 'moment-timezone'
import { Component, OnInit, ViewChild } from '@angular/core'
import { NgxSpinnerService } from 'ngx-spinner'
import { AppConstant, DeleteAlertDataModel } from "../../app.constants";
import { MatDialog} from '@angular/material'
import { DeleteDialogComponent } from '../../components/common/delete-dialog/delete-dialog.component';
import { DashboardService, Notification, NotificationService, AlertsService, DeviceService } from '../../services';
import { SlickCarouselComponent } from 'ngx-slick-carousel';

/*Dynamic Dashboard Code*/
import {ChangeDetectorRef , EventEmitter} from '@angular/core';
import { DynamicDashboardService } from 'app/services/dynamic-dashboard/dynamic-dashboard.service';
import {DisplayGrid, CompactType, GridsterConfig, GridsterItem, GridsterItemComponent, GridsterPush, GridType, GridsterComponentInterface, GridsterItemComponentInterface} from 'angular-gridster2';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
/*Dynamic Dashboard Code*/

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit {
  lat = 32.897480;
  lng = -97.040443;
  mediaUrl = "";
  graphdata: any = [];
  buildingList: any = [];
  isShowLeftMenu = true;
  isSearch = false;
  mapview = true;
  totalAlerts: any;
  totalBuilding: any;
  totalZones: any;
  totalIndoorZones: any;
  totalOutdoorZones: any;

  deleteAlertDataModel: DeleteAlertDataModel;
  searchParameters = {
    pageNumber: 0,
    pageNo: 0,
    pageSize: 10,
    searchText: '',
    sortBy: 'uniqueId asc'
  };
  ChartHead = ['Date/Time'];
  chartData = [];
  datadevice: any = [];
  columnArray: any = [];
  headFormate: any = {
    columns: this.columnArray,
    type: 'NumberFormat'
  };
  bgColor = '#fff';
  chartHeight = 320;
  chartWidth = '100%';
  
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  slideConfig = {
    'slidesToShow': 3,
    'slidesToScroll': 1,
    'arrows': true,
    'margin': '30px',
    'centerMode': false,
    'infinite': true
  };
  @ViewChild('homeCarousel', { static: true }) homeCarousel: SlickCarouselComponent;
  totallight: any;
  underMaintenanceCount: any;
  highenergy: any;
  energyCount: any;
  connectedDeviceCount: any;
  disconnectedDeviceCount: any;
  totalRunning: any;

    	/*Dynamic Dashboard Code*/
	@ViewChild('gridster',{static:false}) gridster;
	isDynamicDashboard : boolean = true;
	options: GridsterConfig;
	dashboardWidgets: Array<any> = [];
	dashboardList = [];
	dashboardData = {
   		id : '',
   		index : 0,
   		dashboardName : '',
   		isDefault : false,
   		widgets : []
   	};
   	resizeEvent: EventEmitter<any> = new EventEmitter<any>();
   	alertLimitchangeEvent: EventEmitter<any> = new EventEmitter<any>();
	chartTypeChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	zoomChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	telemetryDeviceChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	telemetryAttributeChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	sideBarSubscription : Subscription;
	deviceData: any = [];
	/*Dynamic Dashboard Code*/

  constructor(
    private spinner: NgxSpinnerService,
    private dashboardService: DashboardService,
    private _notificationService: NotificationService,
    public _appConstant: AppConstant,
    public dialog: MatDialog,
    private deviceService: DeviceService,
    public _service: AlertsService,
    public dynamicDashboardService: DynamicDashboardService,

  ) {
    this.mediaUrl = this._notificationService.apiBaseUrl;
    	/*Dynamic Dashboard Code*/
		this.sideBarSubscription = this.dynamicDashboardService.isToggleSidebarObs.subscribe((toggle) => {
			if(this.isDynamicDashboard && this.dashboardList.length > 0){
			}
	    })
		/*Dynamic Dashboard Code*/
  }

  ngOnInit() {
    this.getDashbourdCount();
    this.getDeviceList();

    /*Dynamic Dashboard Code*/
		this.options = {
			gridType: GridType.Fixed,
			displayGrid: DisplayGrid.Always,
			initCallback: this.gridInit.bind(this),
			itemResizeCallback: this.itemResize.bind(this),
			fixedColWidth: 20,
			fixedRowHeight: 20,
			keepFixedHeightInMobile: false,
			keepFixedWidthInMobile: false,
			mobileBreakpoint: 640,
			pushItems: false,
			draggable: {
				enabled: false
			},
			resizable: {
				enabled: false
			},
			enableEmptyCellClick: false,
			enableEmptyCellContextMenu: false,
			enableEmptyCellDrop: false,
			enableEmptyCellDrag: false,
			enableOccupiedCellDrop: false,
			emptyCellDragMaxCols: 50,
			emptyCellDragMaxRows: 50,

			minCols: 60,
			maxCols: 192,
			minRows: 52,
			maxRows: 375,
			setGridSize: true,
			swap: true,
			swapWhileDragging: false,
			compactType: CompactType.None,
			margin : 0,
			outerMargin : true,
			outerMarginTop : null,
			outerMarginRight : null,
			outerMarginBottom : null,
			outerMarginLeft : null,
		};
		/*Dynamic Dashboard Code*/
  }

/**
	 * Get Alerts
	 * */
  getAlertList() {
    let parameters = {
      pageNo: 0,
      pageSize: 10,
      searchText: '',
      orderBy: 'eventDate desc',
      deviceGuid: '',
      entityGuid: '',
    };
    this.spinner.show();
    this._service.getAlerts(parameters).subscribe(response => {
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
	 * Convert Value in Float
   * @param value
	 * */
  convertToFloat(value) {
    return parseFloat(value)
  }
  /**
	 * Get Energy Data on Change Event
   * @param event
	 * */
  changeenergy(event) {
    let type = 'd';
    if (event.value === 'Week') {
      type = 'w';
    } else if (event.value === 'Month') {
      type = 'm';
    }
    this.getenergyusageGraph(type)

  }
  /**
	 * Get Energy Usage Graph Data
   * @param companyguid
   * @param frequency
	 * */
  getenergyusageGraph(type) {
    this.spinner.show();
    var data = {
      "companyguid": this.currentUser.userDetail.companyId,
      "frequency": type
     }
    this.dashboardService.getenergyusageGraph(data).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true && response.data != '') {
          this.graphdata = response.data;
          this.highenergy = this.graphdata[0].energy
      }else{
        this.graphdata = []
      }
    })
  }
  
  /**
	 * Percentage Callback Function
   * @param val
	 * */
  getper(val){
  let data  =  val * 100/this.highenergy
  return data;
  }
  public dashCountObj:any={};
	/**
	 * Get count of variables for Dashboard
   * @param companyId
	 * */
  getDashbourdCount() {
    this.spinner.show();
    this.dashboardService.getDashboardoverview(this.currentUser.userDetail.companyId).subscribe(response => {
      if (response.isSuccess === true && response.data) {
        this.totalAlerts = response.data.totalAlerts;
        this.totalBuilding = response.data.totalEntities;
        this.totalZones = response.data.totalSubEntities;
        this.totalIndoorZones = response.data.totalIndoorZones;
        this.totalOutdoorZones = response.data.totalOutdoorZones;
        this.totallight = response.data.totalDevices;
        this.energyCount = response.data.energyCount;
        this.connectedDeviceCount = response.data.connectedDeviceCount;
        this.disconnectedDeviceCount = response.data.disconnectedDeviceCount;
        this.underMaintenanceCount = response.data.totalUnderMaintenanceCount;
        this.totalRunning = response.data.totalRunning;
        this.dashCountObj=response.data;
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
	 * Get Alerts for Dashboard
	 * */
  public alerts: any = [];

/**
   * Serch text
   * @param filterText
   */
  search(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNo = 0;
    this.getBuildingList();
  }
   /**
	 * Get Building List
   * @param pageNumber
   * @param pageNo
   * @param pageSize
   * @param searchText
   * @param sortBy
	 * */

  getBuildingList() {
    this.buildingList = [];
    this.spinner.show();
    this.dashboardService.getBuildinglist(this.searchParameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.buildingList = response.data.items
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
   * Open Delete Popup
   * @param id
   */
  deleteModel(id: any) {
    this.deleteAlertDataModel = {
      title: "Delete Building",
      message: this._appConstant.msgConfirm.replace('modulename', "Building"),
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
        this.deleteBuilding(id);
      }
    });
  }

/**
   * Serch text
   * @param filterText
   */

  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNumber = 0;
    this.getBuildingList();
    this.isSearch = true;
  }
/**
   * Delete building by Buildingguid
   * @param Buildingguid
   */
  deleteBuilding(Buildingguid) {
    this.spinner.show();
    this.dashboardService.deleteBuilding(Buildingguid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Building")));
        this.getBuildingList();

      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }

    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  getLocalDate(lDate) {
    var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
    // Get the local version of that date
    var localDate = moment(utcDate).local();
    let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
    return res;

  }

  	/*Dynamic Dashboard Code*/
	getDashboards(){
		this.spinner.show();
		this.dashboardList = [];
		let isAnyDefault = false;
		let systemDefaultIndex = 0;
		this.dynamicDashboardService.getUserWidget().subscribe(response => {
			this.isDynamicDashboard = false;
			for (var i = 0; i <= (response.data.length - 1); i++) {
				response.data[i].id = response.data[i].guid;
				response.data[i].widgets = JSON.parse(response.data[i].widgets);
				this.dashboardList.push(response.data[i]);
				if(response.data[i].isDefault === true){
					isAnyDefault = true;
					this.dashboardData.index = i;
					this.isDynamicDashboard = true;
				}
				if(response.data[i].isSystemDefault === true){
					systemDefaultIndex = i;
				}
			}
			/*Display Default Dashboard if no data*/
			if(!isAnyDefault && response.data.length > 0){
				this.dashboardData.index = systemDefaultIndex;
				this.isDynamicDashboard = true;
				this.dashboardList[systemDefaultIndex].isDefault = true;
			}
			/*Display Default Dashboard if no data*/
			this.spinner.hide();
			if(this.isDynamicDashboard){
				this.editDashboard('view','n');
			}
			else{
				this.getBuildingList();
				let type  = "d";
        this.getenergyusageGraph(type)
				this.getAlertList();
			}
		}, error => {
			this.spinner.hide();
			/*Load Old Dashboard*/
			this.isDynamicDashboard = false;
			this.getBuildingList();
			let type  = "d";
      this.getenergyusageGraph(type)
			this.getAlertList();
			/*Load Old Dashboard*/
      this._notificationService.add(new Notification('error', error));
		});
	}

	editDashboard(type : string = 'view',is_cancel_btn : string = 'n'){
		this.spinner.show();
		this.dashboardWidgets = [];

		this.dashboardData.id = '';
		this.dashboardData.dashboardName = '';
		this.dashboardData.isDefault = false;
		for (var i = 0; i <= (this.dashboardList[this.dashboardData.index].widgets.length - 1); i++) {
			this.dashboardWidgets.push(this.dashboardList[this.dashboardData.index].widgets[i]);
		}

		if (this.options.api && this.options.api.optionsChanged) {
			this.options.api.optionsChanged();
		}
		this.spinner.hide();
	}

	gridInit(grid: GridsterComponentInterface) {
		if (this.options.api && this.options.api.optionsChanged) {
			this.options.api.optionsChanged();
		}
		/*let cond = false;
    	Observable.interval(500)
		.takeWhile(() => !cond)
		.subscribe(i => {
			cond = true;
			this.checkResponsiveness();
		});*/
	}

	checkResponsiveness(){
		if(this.gridster){
			let tempWidth = 20;
			if(this.gridster.curWidth >= 640 && this.gridster.curWidth <= 1200){
				/*tempWidth = Math.floor((this.gridster.curWidth / 60));
				this.options.fixedColWidth = tempWidth;*/
			}
			else{
				this.options.fixedColWidth = tempWidth;
			}
			for (var i = 0; i <= (this.dashboardWidgets.length - 1); i++) {
				if(this.gridster.curWidth < 640){
					for (var g = 0; g <= (this.gridster.grid.length - 1); g++) {
						if(this.gridster.grid[g].item.id == this.dashboardWidgets[i].id){
							this.dashboardWidgets[i].properties.w = this.gridster.grid[g].el.clientWidth;
						}
					}
				}
				else{
					this.dashboardWidgets[i].properties.w = (tempWidth * this.dashboardWidgets[i].cols);
				}
				this.resizeEvent.emit(this.dashboardWidgets[i]);
			}
			this.changedOptions();
		}
	}

	changedOptions() {
		if (this.options.api && this.options.api.optionsChanged) {
	      this.options.api.optionsChanged();
	    }
	}

	itemResize(item: any, itemComponent: GridsterItemComponentInterface) {
		this.resizeEvent.emit(item);
	}

	deviceSizeChange(size){
		this.checkResponsiveness();
	}

	getDeviceList(){
		this.spinner.show();
		this.deviceData = [];
		this.deviceService.getdevices().subscribe(response => {
			if (response.isSuccess === true){
				this.deviceData = response.data;
			}
			else {
        this._notificationService.add(new Notification('error', response.message));
      }
      
        
			  this.getDashboards();
		}, error => {
			this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
		});
	}
	/*Dynamic Dashboard Code*/

}
