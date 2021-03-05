import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeleteAlertDataModel, AppConstant } from '../../../app.constants';
import { DeleteDialogComponent } from '../..';
import { MatDialog } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { ScheduledMaintenanceService, NotificationService, Notification } from '../../../services';
import * as moment from 'moment'
@Component({
  selector: 'app-scheduled-maintenance-list',
  templateUrl: './scheduled-maintenance-list.component.html',
  styleUrls: ['./scheduled-maintenance-list.component.css']
})
export class ScheduledMaintenanceListComponent implements OnInit {

  isSearch = false;
  moduleName = "Scheduled Maintenance";
  totalRecords = 0;
  order = true;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  reverse = false;
  orderBy = "name";
  searchParameters = {
    entityGuid: '',
    pageNumber: 0,
    pageSize: 10,
    searchText: '',
    sortBy: 'startDateTime  desc'
  };
  deleteAlertDataModel: DeleteAlertDataModel;
  displayedColumns: string[] = ['building', 'zone', 'name', 'status','startDateTime', 'endDateTime', 'actions'];
  scheduledMaintenanceList = [];

  constructor(private router: Router,
    public _appConstant: AppConstant,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private _service: ScheduledMaintenanceService,
    private _notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.getMaintenanceList();
  }
/**
   * Get local Date
   * @param date
   */
  getLocaleDate(date) {
    var stillUtc = moment.utc(date).toDate();
    var local = moment(stillUtc).local().format('MMM DD, YYYY hh:mm:ss A');
    return local;
  }

  /**
   * Search text from list
   * @param filterText
   */
  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNumber = 0;
    this.getMaintenanceList();
    this.isSearch = true;
  }

  /**
   * Manage maintenance schedule
   * */
  scheduleMaintenance() {
    this.router.navigate(['/maintenance/add']);
  }
 /**
   * Delete Popup
   * @param model
   * */
  deleteModel(model: any) {
    this.deleteAlertDataModel = {
      title: "Delete Scheduled Maintenance",
      message: this._appConstant.msgConfirm.replace('modulename', "Scheduled Maintenance"),
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
        this.deleteMaintenance(model.guid);
      }
    });
  }
/**
   * Delete maintdnance by guid
   * @param guid
   * */
  deleteMaintenance(guid) {
    this.spinner.show();
    this._service.deleteMaintenance(guid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Scheduled Maintenance")));
        this.getMaintenanceList();
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
   * Page Size Callback
   * @param pageSize
   * */
  onPageSizeChangeCallback(pageSize) {
    this.searchParameters.pageSize = pageSize;
    this.searchParameters.pageNumber = 1;
    this.isSearch = true;
    this.getMaintenanceList();
  }
 /**
   * Get maintenance List
   * */
  getMaintenanceList() {
    this.spinner.show();
    this._service.getScheduledMaintenanceList(this.searchParameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.totalRecords = response.data.count;
        // this.isSearch = false;
        if (response.data.count) {
          this.scheduledMaintenanceList = response.data.items;
        } else {
          this.scheduledMaintenanceList = [];
        }
        //console.log(this.scheduledMaintenanceList);
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
        this.scheduledMaintenanceList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
 /**
   * Order by field
   * @param sort
   * */
  setOrder(sort: any) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    if (sort.active == 'name') {
      sort.active = 'devicename';
    }
    this.searchParameters.sortBy = sort.active + ' ' + sort.direction;

    this.getMaintenanceList();

  }
 /**
   * Change PaginationBy pageNo
   * @param pagechangeresponse
   * */
  ChangePaginationAsPageChange(pagechangeresponse) {
    this.searchParameters.pageSize = pagechangeresponse.pageSize;
    this.searchParameters.pageNumber = pagechangeresponse.pageIndex;
    this.isSearch = true;
    this.getMaintenanceList();
  }
}
