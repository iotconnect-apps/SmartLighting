import 'rxjs/add/operator/map'

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'
import { ApiConfigService, NotificationService } from 'app/services';
import * as moment from 'moment'
@Injectable({
  providedIn: 'root'
})

export class ScheduledMaintenanceService {
  protected apiServer = ApiConfigService.settings.apiServer;
  cookieName = 'FM';
  constructor(private cookieService: CookieService,
    private httpClient: HttpClient,
    private _notificationService: NotificationService) {
    this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
  }

  /**
   * Manage Schedule Maintenance
   * @param data
   */
  scheduleMaintenance(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/devicemaintenance/manage', data).map(response => {
      return response;
    });
  }

  /**
   * Get building lookup by companyId
   * @param companyId
   */
  getBuildingLookup(companyId) {

    //let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //companyId = currentUser.userDetail.companyId
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/buildinglookup/' + companyId).map(response => {
      return response;
    });
  }

  /**
   * Get wing lookup by buildingId
   * @param buildingId
   */
  getWingLookup(buildingId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/winglookup/' + buildingId).map(response => {
      return response;
    });
  }

  /**
   * Get elevator lookup by wingId
   * @param wingId
   */
  getElevatorLookup(wingId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/devicelookup/' + wingId).map(response => {
      return response;
    });
  }

  /**
   * Get schedule maintenance details by guid
   * @param guid
   */
  getScheduledMaintenanceDetails(guid) {
    let currentDate=moment(new Date()).format('YYYY-MM-DDTHH:mm:ss');
    var timeZone = moment().utcOffset();
    var path='api/devicemaintenance/'+guid+'?currentDate='+currentDate+'&timeZone='+timeZone;
    return this.httpClient.get<any>(this.apiServer.baseUrl + path).map(response => {
      return response;
    });
  }

  getTimeZone() {
    return /\((.*)\)/.exec(new Date().toString())[1];
  }
  getScheduledMaintenanceList(parameters) {
    const reqParameter = {
      params: {
        'entityGuid': parameters.entityGuid,
        'pageNo': parameters.pageNumber + 1,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.sortBy,
        'currentDate':moment(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
        'timeZone': moment().utcOffset().toString()
      }
    };

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/devicemaintenance/search', reqParameter).map(response => {
      return response;
    });
  }

  deleteMaintenance(guid) {

    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/devicemaintenance/delete/' + guid, "").map(response => {
      return response;
    });
  }
}
