import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog } from "@angular/material";
import { DeleteDialogComponent } from "../../../components/common/delete-dialog/delete-dialog.component";
import { AppConstant, DeleteAlertDataModel } from "../../../app.constants";
import { Notification, NotificationService } from "../../../services";
import { BuildingService } from "../../../services/building/building.service";
@Component({
  selector: 'app-building-list',
  templateUrl: './building-list.component.html',
  styleUrls: ['./building-list.component.css']
})
export class BuildingListComponent implements OnInit {

  changeStatusDeviceName: any;
  changeStatusDeviceStatus: any;
  changeDeviceStatus: any;
  buildingList = [];
  moduleName = "buildings";
  order = true;
  isSearch = false;
  totalRecords = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  reverse = false;
  orderBy = "name";
  searchParameters = {
    parentEntityGuid: '',
    pageNumber: -1,
    pageSize: -1,
    searchText: "",
    sortBy: "name asc"
  };
  deleteAlertDataModel: DeleteAlertDataModel;
  displayedColumns: string[] = ["name", "address", "city", "zipcode", "description", "isActive", "action"];
  mediaUrl: any;

  constructor(
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public _appConstant: AppConstant,
    private _notificationService: NotificationService,
    public buildingsService: BuildingService,
  ) { }

  ngOnInit() {
    this.mediaUrl = this._notificationService.apiBaseUrl;
    this.getbuildingList();
  }

 /**
   *Sort by field
   * @param sort
   */ 

  setOrder(sort: any) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.searchParameters.sortBy = sort.active + ' ' + sort.direction;
    this.getbuildingList();
  }
/**
   *Delete Building by id
   * @param userModel
   */
  deleteModel(userModel: any) {
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
        this.deletebuilding(userModel.guid);
      }
    });
  }
/**
   * Change Pagination by Event
   * @param pageSize
   */
  onPageSizeChangeCallback(pageSize) {
    this.searchParameters.pageSize = pageSize;
    this.searchParameters.pageNumber = 1;
    this.isSearch = true;
    this.getbuildingList();
  }
/**
   * Change Status by Event
   * @param id
   * @param isActive
   * @param name
   */
  activeInactivebuilding(id: string, isActive: boolean, name: string) {
    var status = isActive == false ? this._appConstant.activeStatus : this._appConstant.inactiveStatus;
    var mapObj = {
      statusname: status,
      fieldname: name,
      modulename: "Building"
    };
    this.deleteAlertDataModel = {
      title: "Status",
      message: this._appConstant.msgStatusConfirm.replace(/statusname|fieldname/gi, function (matched) {
        return mapObj[matched];
      }),
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
        this.changeBuildingStatus(id, isActive);

      }
    });

  }
/**
   * Change Pagination by Event
   * @param pagechangeresponse
   */
  ChangePaginationAsPageChange(pagechangeresponse) {
    this.searchParameters.pageNumber = pagechangeresponse.pageIndex;
    this.searchParameters.pageSize = pagechangeresponse.pageSize;
    this.isSearch = true;
    this.getbuildingList();
  }
/**
   * Search by Text
   * @param filterText
   */
  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNumber = 0;
    this.getbuildingList();
    this.isSearch = true;
  }
/**
   * Get building List
   */
  getbuildingList() {
    this.spinner.show();
    this.buildingsService.getBuilding(this.searchParameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.totalRecords = response.data.count;
        // this.isSearch = false;
        this.buildingList = response.data.items;
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
        this.buildingList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
/**
   * Delete building by buildingid
   * @param guid
   */
  deletebuilding(guid) {
    this.spinner.show();
    this.buildingsService.deleteBuilding(guid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Building")));
        this.getbuildingList();

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
   * Change Status by buildingid
   * @param id
   */
  changeBuildingStatus(id, isActive) {

    this.spinner.show();
    this.buildingsService.changeStatus(id, isActive).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgStatusChange.replace("modulename", "Building")));
        this.getbuildingList();

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
