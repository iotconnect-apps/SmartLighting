import { ChangeDetectorRef, ViewRef , OnInit, Component, Input, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner'
import { DashboardService } from 'app/services/dashboard/dashboard.service';
import { Notification, NotificationService } from 'app/services';
import { Subscription } from 'rxjs/Subscription';
import { AgmMap} from '@agm/core';
import { Router } from '@angular/router';
// import { locationobj } from '../../../dashboard/dashboard-model';
import { AppConstant, DeleteAlertDataModel } from "../../../../app.constants";
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { DeleteDialogComponent } from '../../../../components/common/delete-dialog/delete-dialog.component';


@Component({
	selector: 'app-widget-map-a',
	templateUrl: './widget-map-a.component.html',
	styleUrls: ['./widget-map-a.component.css']
})
export class WidgetMapAComponent implements OnInit, OnDestroy {
	lat = 32.897480;
	lng = -97.040443;
	locationlist: any = [];
	isShowLeftMenu = true;
  mapview = true;
  mediaUrl: any;
	searchParameters = {
		pageNumber: 0,
		pageNo: 0,
		pageSize: 10,
		searchText: '',
		sortBy: 'uniqueId asc'
	  };
	deleteAlertDataModel: DeleteAlertDataModel;
	@Input() widget;
	@Input() count;
	@Input() resizeEvent: EventEmitter<any>;
	@Input() zoomChangeEvent: EventEmitter<any>;
	resizeSub: Subscription;
	zoomSub: Subscription;

	@ViewChild(AgmMap,{static:false}) myMap : any;
	mapHeight = '300px';
	greenhouse = [];
	constructor(
		private router: Router,
		public dashboardService: DashboardService,
		private spinner: NgxSpinnerService,
		private _notificationService: NotificationService,
		private changeDetector: ChangeDetectorRef,
		public _appConstant: AppConstant,
		public dialog: MatDialog,
		) {
	}

  ngOnInit() {
    this.mediaUrl = this._notificationService.apiBaseUrl;
		this.mapHeight = (this.widget.properties.h > 0 ? parseInt((this.widget.properties.h - 57).toString())+'px' : this.mapHeight);
		this.widget.widgetProperty.zoom = (this.widget.widgetProperty.zoom && this.widget.widgetProperty.zoom > 0 ? parseInt(this.widget.widgetProperty.zoom) : 10);
		this.resizeSub = this.resizeEvent.subscribe((widget) => {
			if(widget.id == this.widget.id){
				this.widget = widget;
				this.resizeMap();
			}
		});
		this.zoomSub = this.zoomChangeEvent.subscribe((widget) => {
			if(widget && widget.id == this.widget.id){
				this.widget = widget; 
				this.resizeMap();
			}
		});
		this.resizeMap();
		this.getLocationlist()
	}

	search(filterText) {
		this.searchParameters.searchText = filterText;
		this.searchParameters.pageNo = 0;
		this.getLocationlist();
	}
	
	getLocationlist() {
		this.locationlist = [];
		this.spinner.show();
		this.dashboardService.getBuildinglist(this.searchParameters).subscribe(response => {
			this.spinner.hide();
			if (response.isSuccess === true) {
				this.locationlist = response.data.items;
				this.resizeMap();
				if(response.data.items.length > 0 && response.data.items[0].latitude && response.data.items[0].longitude && response.data.items[0].latitude != '' && response.data.items[0].longitude != ''){
					let newCenter = {
						lat: parseFloat(response.data.items[0].latitude),
						lng: parseFloat(response.data.items[0].longitude),
				    };
				}
				if (this.changeDetector && !(this.changeDetector as ViewRef).destroyed) {
					this.changeDetector.detectChanges();
				}
			}
			else {
				this._notificationService.add(new Notification('error', response.message));
			}
		}, error => {
			this.spinner.hide();
			this._notificationService.add(new Notification('error', error));
		});
	}

	resizeMap(){
		this.mapHeight = (this.widget.properties.h > 0 ? parseInt((this.widget.properties.h - 57).toString())+'px' : this.mapHeight);
		if(this.myMap){
			this.myMap.triggerResize();
		}
	}

	clickAdd() {
		this.router.navigate(['buildings/add']);
	}

	deleteModel(id: any) {
		this.deleteAlertDataModel = {
			title: "Delete Location",
			message: this._appConstant.msgConfirm.replace('modulename', "Location"),
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
				this.deletelocation(id);
			}
		});
	}

	deletelocation(guid) {
		this.spinner.show();
		this.dashboardService.deleteBuilding(guid).subscribe(response => {
		  this.spinner.hide();
		  if (response.isSuccess === true) {
			this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Building")));
			this.getLocationlist();
		  }
		  else {
			this._notificationService.add(new Notification('error', response.message));
		  }
	
		}, error => {
		  this.spinner.hide();
		  this._notificationService.add(new Notification('error', error));
		});
	}

	ngOnDestroy() {
		this.resizeSub.unsubscribe();
		this.zoomSub.unsubscribe();
	}
}
