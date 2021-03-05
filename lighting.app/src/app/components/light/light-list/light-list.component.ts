import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { NgxSpinnerService } from 'ngx-spinner'
import { MatDialog } from '@angular/material';
import { AppConstant } from "../../../app.constants";
import { LightService, Notification, NotificationService } from '../../../services';

@Component({
  selector: 'app-light-list',
  templateUrl: './light-list.component.html',
  styleUrls: ['./light-list.component.css']
})

export class LightListComponent implements OnInit {
  order = true;
  isSearch = false;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  reverse = false;
  orderBy = 'uniqueId';
  totalRecords = 0;
  searchParameters = {
    pageNo: 0,
    pageSize: 10,
    searchText: '',
    sortBy: 'uniqueId asc'
  };
  displayedColumns: string[] = ['uniqueId', 'subEntityName', 'templateName', 'zoneType', 'entityName ', 'isConnected'];
  dataSource = [];

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    public dialog: MatDialog,
    private lightService: LightService,
    private _notificationService: NotificationService,
    public _appConstant: AppConstant
  ) { }



  ngOnInit() {
    this.getLightsList();
  }
  /**
     * Redirect on Add Page
     */
  clickAdd() {
    this.router.navigate(['/lights/add']);
  }
  /**
     * sort Data
     * @param sort
     */
  setOrder(sort: any) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.searchParameters.sortBy = sort.active + ' ' + sort.direction;
    this.getLightsList();
  }


  /**
     * Change Page wise  data
     * @param pagechangeresponse
     */
  ChangePaginationAsPageChange(pagechangeresponse) {
    this.searchParameters.pageNo = pagechangeresponse.pageIndex;
    this.searchParameters.pageSize = pagechangeresponse.pageSize;
    this.isSearch = true;
    this.getLightsList();
  }
  /**
     * Search by text
     * @param filterText
     */
  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNo = 0;
    this.getLightsList();
    this.isSearch = true;
  }



  /**
     * Get Light List
     */
  getLightsList() {
    this.spinner.show();
    this.lightService.getlightList(this.searchParameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.totalRecords = response.data.count;
        this.dataSource = response.data.items;
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
        this.dataSource = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

}
