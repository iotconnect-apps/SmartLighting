import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'
import { ApiConfigService, NotificationService } from 'app/services';
import * as moment from 'moment'

@Injectable()

export class DashboardService {
	cookieName = 'FM';
	protected apiServer = ApiConfigService.settings.apiServer;
	constructor(
		private http: HttpClient,
		private cookieService: CookieService,
		private _notificationService: NotificationService
	) {
		this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
	}

	getDashboardStatistics() {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get(this.apiServer.baseUrl + 'api/dashboard/statistics', configHeader).map(response => {
			return response;
		});
	}

	getNotificationList() {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get(this.apiServer.baseUrl + 'api/dashboard/notification', configHeader).map(response => {
			return response;
		});
	}

	getTruckUsage() {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get(this.apiServer.baseUrl + 'api/dashboard/getTruckUsage', configHeader).map(response => {
			return response;
		});
	}

	getTruckActivity() {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get(this.apiServer.baseUrl + 'api/dashboard/getTruckActivity', configHeader).map(response => {
			return response;
		});
	}

	getTruckGraph() {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get(this.apiServer.baseUrl + 'api/dashboard/getTruckGraph', configHeader).map(response => {
			return response;
		});
	}

	getStompCon() {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get(this.apiServer.baseUrl + 'api/dashboard/getStompConfiguration', configHeader).map(response => {
			return response;
		});
	}

	getDeviceAttributeHistoricalData(data) {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.post(this.apiServer.baseUrl + 'api/dashboard/getDeviceAttributeHistoricalData', data, configHeader).map(response => {
			return response;
		});
	}

	getSensors(data) {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.post(this.apiServer.baseUrl + 'api/dashboard/getDeviceAttributes', data, configHeader).map(response => {
			return response;
		});
	}

	tripStatus(id, data) {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.put<any>(this.apiServer.baseUrl + 'api/trip/' + id + '/status', data, configHeader).map(response => {
			return response;
		});
	}

	startSimulator(id, isSalesTemplate = true) {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get<any>(this.apiServer.baseUrl + 'api/trip/startSimulator/' + id + '/' + isSalesTemplate, configHeader).map(response => {
			return response;
		});
	}

	getDashboardoverview(companyId) {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};
		let currentDate = moment(new Date()).format('YYYY-MM-DDTHH:mm:ss');
    var timeZone = moment().utcOffset();
		var path = 'api/dashboard/overview/' + companyId + '?currentDate=' + currentDate + '&timeZone=' + timeZone;

		return this.http.get<any>(this.apiServer.baseUrl + path, configHeader).map(response => {
			return response;
		});
	}
	getTimeZone() {
		return /\((.*)\)/.exec(new Date().toString())[1];
	}

	getAllAlerts() {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get<any>(this.apiServer.baseUrl + 'api/alert', configHeader).map(response => {
			return response;
		});
	}

	getBuildinglist(parameters) {
		const parameter = {
			params: {
				'pageNo': parameters.pageNo + 1,
				'pageSize': parameters.pageSize,
				'searchText': parameters.searchText
			},
			timestamp: Date.now()
		};
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get<any>(this.apiServer.baseUrl + 'api/entity/search', parameter).map(response => {
			return response;
		});
	}
	deleteBuilding(buildingGuid) {
		return this.http.put<any>(this.apiServer.baseUrl + 'api/entity/delete/' + buildingGuid, "").map(response => {
			return response;
		});
	}

	// Convert timestamp ti since time
	timeSince(date) {
		date = new Date(date)
		let minute = 60;
		let hour = minute * 60;
		let day = hour * 24;
		let month = day * 30;
		let year = day * 365;

		let suffix = ' ago';

		let elapsed = Math.floor((Date.now() - date) / 1000);

		if (elapsed < minute) {
			return 'just now';
		}

		// get an array in the form of [number, string]
		let a = elapsed < hour && [Math.floor(elapsed / minute), 'minute'] ||
			elapsed < day && [Math.floor(elapsed / hour), 'hour'] ||
			elapsed < month && [Math.floor(elapsed / day), 'day'] ||
			elapsed < year && [Math.floor(elapsed / month), 'month'] ||
			[Math.floor(elapsed / year), 'year'];

		// pluralise and append suffix
		return a[0] + ' ' + a[1] + (a[0] === 1 ? '' : 's') + suffix;
	}
	getLightlist(parameters, zoneid) {
		const parameter = {
			params: {
				'pageNo': parameters.pageNo + 1,
				'pageSize': parameters.pageSize,
				'searchText': parameters.searchText,
				'entityGuid': zoneid
			},
			timestamp: Date.now()
		};
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get<any>(this.apiServer.baseUrl + 'api/device/search', parameter).map(response => {
			return response;
		});
	}
	getenergyusageGraph(data) {

		return this.http.post<any>(this.apiServer.baseUrl + 'api/chart/getenergyusagebycompany', data).map(response => {
			return response;
		});
	}
	getBuildingGraph(data) {

		return this.http.post<any>(this.apiServer.baseUrl + 'api/chart/getstatisticsbyentity', data).map(response => {
			return response;
		});
	}
	getsensorTelemetryData() {
		return this.http.get<any>(this.apiServer.baseUrl + 'api/lookup/attributes').map(response => {
			return response;
		});
	}
	getLightingGraph(data) {

		return this.http.post<any>(this.apiServer.baseUrl + 'api/chart/getstatisticsbydevice', data).map(response => {
			return response;
		});
	}
	getphotoelectricsGraph(data) {

		return this.http.post<any>(this.apiServer.baseUrl + 'api/chart/getphotoelectricsensorbydevice', data).map(response => {
			return response;
		});
	}
	getintensityGraph(data) {

		return this.http.post<any>(this.apiServer.baseUrl + 'api/chart/getlightintensitybydevice', data).map(response => {
			return response;
		});
	}
	addLighting(data) {

		return this.http.post<any>(this.apiServer.baseUrl + 'api/devicesetting/manage', data).map(response => {
			return response;
		});
	}

	getsettingdetail(deviceid) {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get<any>(this.apiServer.baseUrl + 'api/devicesetting/' + deviceid, configHeader).map(response => {
			return response;
		});
	}
	getlightdetail(deviceid) {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get<any>(this.apiServer.baseUrl + 'api/device/' + deviceid, configHeader).map(response => {
			return response;
		});
	}
	connectionstatus(deviceid) {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.http.get<any>(this.apiServer.baseUrl + 'api/device/connectionstatus/' + deviceid, configHeader).map(response => {
			return response;
		});
	}
}
