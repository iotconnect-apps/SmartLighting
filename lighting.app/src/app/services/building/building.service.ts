import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

import { ApiConfigService, NotificationService } from 'app/services';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  protected apiServer = ApiConfigService.settings.apiServer;
  cookieName = 'FM';
  constructor(private cookieService: CookieService,
    private _notificationService: NotificationService,
    private httpClient: HttpClient) {
    this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
  }

  /**
   * Country list 
   * */
  getcountryList() {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/country').map(response => {
      return response;
    });
  }

  removeImage(entityId) {
    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/entity/deleteimage/'+entityId,{}).map(response => {
      return response;
    });
  }


  /**
   * State list by country id
   * @param countryId
   */
  getstatelist(countryId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/state/' + countryId).map(response => {
      return response;
    });
  }

  /**
   * Zone type list
   */
  getZoneTypelist() {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/zonetype').map(response => {
      return response;
    });
  }

  /**
   * Add building
   * @param data
   */
  addBuilding(data) {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (data[key])
        formData.append(key, value);
    }

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/entity/manage', formData).map(response => {
      return response;
    });
  }

  /**
   * Get building detail by buildingGuid
   * @param buildingGuid
   */
  getBuildingDetails(buildingGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/entity/' + buildingGuid).map(response => {
      return response;
    });
  }

  getAlerts(facilityGuid) {


    return this.httpClient.get<any>(this.apiServer.baseUrl + 'alert?entityGuid/' + facilityGuid).map(response => {
      return response;
    });
    // return this.http.get<any>(environment.baseUrl + 'alert', configHeader).map(response => {
    // 	return response;
    // });
  }


  /**
   * Get list of building
   * @param parameters
   */
  getBuilding(parameters) {

    const reqParameter = {
      params: {
        'parentEntityGuid': parameters.parentEntityGuid,
        'pageNo': parameters.pageNumber,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.sortBy
      },
      timestamp: Date.now()
    };

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/entity/search', reqParameter).map(response => {
      return response;
    });
  }

  /**
   * Update status
   * @param id
   * @param isActive
   */
  changeStatus(id, isActive) {
    let status = isActive == true ? false : true;
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/entity/updatestatus/' + id + '/' + status, {}).map(response => {
      return response;
    });
  }

  deleteBuilding(buildingGuid) {

    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/entity/delete/' + buildingGuid, "").map(response => {
      return response;
    });
  }
  getsensorTelemetryData() {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/attributes').map(response => {
      return response;
    });
  }
  getFacilitygraph(zoneId, type, attribute) {
    let data = {
      "entityGuid": zoneId,
      "frequency": type,
      "attribute": attribute
    }
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getstatisticsbyentity', data).map(response => {
      return response;
    });
  }
  getSensorDetails(sensorGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/deviceattributelookup/' + sensorGuid).map(response => {
      return response;
    });
  }
  getwqiindexvalue(deviceGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/getaqiindexvalue/' + deviceGuid).map(response => {
      return response;
    });
  }
  /**
   * Add zone
   * @param data
   */
  addzone(data) {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (data[key])
        formData.append(key, value);
    }

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/entity/manage', formData).map(response => {
      return response;
    });
  }
}
