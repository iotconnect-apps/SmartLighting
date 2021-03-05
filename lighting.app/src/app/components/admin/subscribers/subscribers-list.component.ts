import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { NgxSpinnerService } from 'ngx-spinner'
import { MatDialog } from '@angular/material'
import { DeviceService, NotificationService } from 'app/services';
import{Notification} from 'app/services/notification/notification.service';
import { AppConstant } from "../../../app.constants";

@Component({ selector: 'app-subscribers-list', templateUrl: './subscribers-list.component.html', styleUrls: ['./subscribers-list.component.scss'] })

export class SubscribersListComponent implements OnInit {
	order = true;
	isSearch = false;
	pageSizeOptions: number[] = [5, 10, 25, 100];
	reverse = false;
	orderBy = 'companyName';
	totalRecords=0;
	searchParameters = {
		pageNo:0,
		pageSize: 10,
		searchText: '',
		sortBy: 'companyName asc'
	};
	displayedColumns: string[] = [ 'subscriberName','companyName', 'email','subscriptionStartDate','subscriptionEndDate','planName'];
	dataSource=[];
	
	constructor(
		private spinner: NgxSpinnerService,
		private router: Router,
		public dialog: MatDialog,
		private deviceService:DeviceService,
		private _notificationService: NotificationService,
		public _appConstant : AppConstant
	) { }

	ngOnInit() {
		this.getSubscribersList();
	}
	/**
	* Redirect Add Page
    */

	clickAdd() {
		this.router.navigate(['/device/add']);
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
		this.getSubscribersList();
	}

	/**
	* Page Size Callback
	* @param pageSize
    */

	onPageSizeChangeCallback(pageSize) {
		this.searchParameters.pageSize = pageSize;
		this.searchParameters.pageNo = 1;
		this.isSearch = true;
		this.getSubscribersList();
	}
	/**
	 * Change Pagination By Pageno
	 * @param pagechangeresponse
	 */

	ChangePaginationAsPageChange(pagechangeresponse) {
	this.searchParameters.pageNo = pagechangeresponse.pageIndex;
	this.searchParameters.pageSize = pagechangeresponse.pageSize;
	this.isSearch = true;
    this.getSubscribersList();
	}
	/**
   * Search Callback 
   * @param filterText
   */

	searchTextCallback(filterText) {
		this.searchParameters.searchText = filterText;
		this.searchParameters.pageNo = 0;
		this.getSubscribersList();
		this.isSearch = true;
	}

	/**
	 * Get Subscriber List
	 * */
	
	getSubscribersList() {
		this.spinner.show();
		this.deviceService.getsubscribers(this.searchParameters).subscribe(response => {
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
			this._notificationService.add(new Notification('error', error ));
		});
	}
	



}
