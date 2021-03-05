import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { NgxSpinnerService } from 'ngx-spinner'
import { MatDialog } from '@angular/material'
import { DeleteDialogComponent } from '../../../components/common/delete-dialog/delete-dialog.component';
import { Notification , NotificationService, RolesService } from './../../../services/index'
import { AppConstant, DeleteAlertDataModel } from "../../../app.constants";


@Component({
	selector: 'app-roles-list',
	templateUrl: './roles-list.component.html',
	styleUrls: ['./roles-list.component.css']
})
export class RolesListComponent implements OnInit {

  currentUser = JSON.parse(localStorage.getItem("currentUser"));
	changeStatusDeviceName:any;
	changeStatusDeviceStatus:any;
	changeDeviceStatus:any;
	moduleName = "Roles";
	order = true;
	isSearch = false;
	totalRecords = 5;
	pageSizeOptions: number[] = [5, 10, 25, 100];
	reverse = false;
	searchParameters = {
		pageNumber: 0,
		pageSize: 10,
		searchText: '',
		sortBy: 'name asc'
	};
	displayedColumns: string[] = ['name', 'description', 'isActive', 'action'];
	rolesList = [];
	deleteAlertDataModel : DeleteAlertDataModel ; 


	constructor(
		private spinner: NgxSpinnerService,
		private router: Router,
		public dialog: MatDialog,
		public rolesService : RolesService,
		private _notificationService: NotificationService,
		public _appConstant : AppConstant
	) { }

	ngOnInit() {
		this.getRolesList();
	}
/**
   * Redirect Add Page
   */
	clickAdd() {
		this.router.navigate(['/roles/add']);
	}
/**
   * Sort By field
   * @param sort
   */
	setOrder(sort: any) {
		if (!sort.active || sort.direction === '') {
			return;
	   }
	  	this.searchParameters.sortBy = sort.active + ' ' + sort.direction;
		this.getRolesList();
	}
/**
   * Delete Popup
   * @param userModel
   */
	deleteModel(userModel: any) {
		this.deleteAlertDataModel = {
			title: "Delete Role" ,
			message: this._appConstant.msgConfirm.replace('modulename', "Role"), 
			okButtonName: "Yes",
			cancelButtonName: "No" ,
		};
		const dialogRef = this.dialog.open(DeleteDialogComponent, {
			width: '400px',
			height: 'auto',
			data: this.deleteAlertDataModel,
			disableClose: false
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.deleteRole(userModel.guid);
			}
		});
	}
/**
   * Role Change Status
   * @param roleId
   * @param isActive
   * @param name
   */
	activeInactiveRole(roleId: string, isActive: boolean, name:string) {
		var status = isActive == false ? this._appConstant.activeStatus : this._appConstant.inactiveStatus;
		var mapObj = {
			statusname:status,
			fieldname:name,
			modulename:"role"
		 };
		this.deleteAlertDataModel = {
			title: "Status",
			message: this._appConstant.msgStatusConfirm.replace(/statusname|fieldname|modulename/gi, function(matched){
				return mapObj[matched];
			  }),
			okButtonName: "Yes",
			cancelButtonName: "No" ,
		};
		const dialogRef = this.dialog.open(DeleteDialogComponent, {
			width: '400px',
			height: 'auto',
			data: this.deleteAlertDataModel,
			disableClose: false
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.changeRoleStatus(roleId, isActive);

			}
		});
	
	}
/**
   * Change Pagination By PageNo
   * @param pagechangeresponse
   */
	ChangePaginationAsPageChange(pagechangeresponse) {
		this.searchParameters.pageSize = pagechangeresponse.pageSize;
		this.searchParameters.pageNumber = pagechangeresponse.pageIndex;
		this.isSearch = true;
		this.getRolesList();
	}
/**
   * SearchTextCallback
   * @param filterText
   */
	searchTextCallback(filterText) {
		this.searchParameters.searchText = filterText;
		this.searchParameters.pageNumber = 0;
		this.isSearch = true;
		this.getRolesList();
	}
 /**
 * Get Role List 
 * */
	getRolesList() {
		this.spinner.show();
		this.rolesService.getRoles(this.searchParameters).subscribe(response => {
			this.spinner.hide();
		
			if (response.isSuccess === true) {
				this.totalRecords = response.data.count;
				this.rolesList = response.data.items;
			}
			else {
				this._notificationService.add(new Notification('error', response.message));
				this.rolesList = [];
			}
		}, error => {
			this.spinner.hide();
			this._notificationService.add(new Notification('error', error ));
		});
	}
 /**
   * Change Role Status
   * @param roleId
   * @param isActive
   */
	changeRoleStatus(roleId, isActive) {
	
		this.spinner.show();
		this.rolesService.changeStatus(roleId, isActive).subscribe(response => {
			this.spinner.hide();
			if (response.isSuccess === true) {
				this._notificationService.add(new Notification('success', this._appConstant.msgStatusChange.replace("modulename", "Role")));
				this.getRolesList();

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
   * Delete Role By roleId
   * @param roleId
   */
	deleteRole(roleId) {
		this.spinner.show();
		this.rolesService.deleteRole(roleId).subscribe(response => {
			this.spinner.hide();
			if (response.isSuccess === true) {
				this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Role")));
				this.getRolesList();

			}
			else {
				this._notificationService.add(new Notification('error', response.message));
			}
			
		}, error => {
			this.spinner.hide();
			this._notificationService.add(new Notification('error', error));
		});
	}


}
