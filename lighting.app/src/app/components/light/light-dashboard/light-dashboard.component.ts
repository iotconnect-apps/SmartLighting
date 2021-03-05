import { Component, OnInit, ViewChild } from '@angular/core';
import { Options } from 'ng5-slider';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AppConstant, DeleteAlertDataModel } from "../../../app.constants";
import { MatDialog } from "@angular/material";
import { StompRService } from '@stomp/ng2-stompjs'
import { Message } from '@stomp/stompjs'
import { Subscription } from 'rxjs'
import { Observable } from 'rxjs';
import * as moment from 'moment-timezone'
import * as _ from 'lodash'
import 'chartjs-plugin-streaming';
import { DeviceService, NotificationService, DashboardService, Notification } from '../../../services';
import { DeleteDialogComponent } from '../..';


@Component({
  selector: 'app-light-dashboard',
  templateUrl: './light-dashboard.component.html',
  styleUrls: ['./light-dashboard.component.css'],
  providers: [StompRService]
})
export class LightDashboardComponent implements OnInit {
  @ViewChild('tabGroup', { static: false }) tabGroup;

  chartColors: any = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',
    cerise: 'rgb(255,0,255)',
    popati: 'rgb(0,255,0)',
    dark: 'rgb(5, 86, 98)',
    solid: 'rgb(98, 86, 98)',
    tenwik: 'rgb(13, 108, 179)',
    redmek: 'rgb(143, 25, 85)',
    yerows: 'rgb(249, 43, 120)',
    redies: 'rgb(225, 208, 62)',
    orangeies: 'rgb(225, 5, 187)',
    yellowies: 'rgb(74, 210, 80)',
    greenies: 'rgb(74, 210, 165)',
    blueies: 'rgb(128, 96, 7)',
    purpleies: 'rgb(8, 170, 196)',
    greyies: 'rgb(122, 35, 196)',
    ceriseies: 'rgb(243, 35, 196)',
    popatiies: 'rgb(243, 35, 35)',
    darkies: 'rgb(87, 17, 35)',
    solidies: 'rgb(87, 71, 35)',

  };
  datasets: any[] = [
    {
      label: 'Dataset 1 (linear interpolation)',
      backgroundColor: 'rgb(153, 102, 255)',
      borderColor: 'rgb(153, 102, 255)',
      fill: false,
      lineTension: 0,
      borderDash: [8, 4],
      data: []
    }
  ];
  optionsdata: any = {
    type: 'line',
    scales: {

      xAxes: [{
        type: 'realtime',
        time: {
          stepSize: 10
        },
        realtime: {
          duration: 90000,
          refresh: 1000,
          delay: 2000,
          //onRefresh: '',

          // delay: 2000

        }

      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'value'
        }
      }]

    },
    tooltips: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }

  };
  deleteAlertDataModel: DeleteAlertDataModel;
  isEdit = false;
  checkSubmitStatus = false;
  LightingForm: FormGroup;
  lightobject: any = {};
  formobject: any = {};
  dataobj: any = {};
  isshow = false;
  isvalid = true;
  sliderValue: number;
  sliderOptions: Options = {
    floor: 0,
    ceil: 100,
    animate: true
  };

  lineChartData = {
    chartType: 'LineChart',
    dataTable: [],
    options: {
      title: '',
      height: 350,
      interpolateNulls: true,
      hAxis: {
        title: '',
        gridlines: {
          count: 5
        },
      },
      vAxis: {
        title: 'KW',
        gridlines: {
          count: 5
        },
      },
      legend: 'none',
      chartArea: { width: '85%' }
    },

  }
  intensityChartData = {
    chartType: 'LineChart',
    dataTable: [],
    options: {
      width: '100%',
      height: 350,
      interpolateNulls: true,
      hAxis: {
        title: 'Months',
        gridlines: {
          count: 5
        },
      },
      vAxis: {
        title: 'KW',
        gridlines: {
          count: 5
        },
      },
      legend: 'none',
      chartArea: { width: '85%' }
    },
  }
  photoelectricsChartData = {
    chartType: 'LineChart',
    dataTable: [],
    options: {
      title: '',
      width: '100%',
      height: 350,
      interpolateNulls: true,
      hAxis: {
        title: 'Months',
        gridlines: {
          count: 5
        },
      },
      vAxis: {
        title: 'KW',
        gridlines: {
          count: 5
        },
      },
      legend: 'none',
      chartArea: { width: '85%' }
    },
  }
  deviceIsConnected = false;
  isConnected = false;
  subscription: Subscription;
  messages: Observable<Message>;
  cpId = '';
  subscribed;
  stompConfiguration = {
    url: '',
    headers: {
      login: '',
      passcode: '',
      host: ''
    },
    heartbeat_in: 0,
    heartbeat_out: 2000,
    reconnect_delay: 5000,
    debug: true
  }
  lightGuid: any;
  buttonname = 'Save';
  scheduledFlag = true;
  presenceFlag = true
  intensityFlag = true
  selectedIndex = 0;
  uniqueId: any;
  capacity: any;
  entityName: any;
  templateName: any;
  constructor(private stompService: StompRService, private deviceService: DeviceService, private _notificationService: NotificationService, public dashboardService: DashboardService, private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService, public _appConstant: AppConstant, public dialog: MatDialog,) {
    this.createFormGroup();
    this.activatedRoute.params.subscribe(params => {
      if (params.lightGuid) {
        this.lightGuid = params.lightGuid
        this.getlightdetail(this.lightGuid)
      }

    })
    this.formobject = { Dimming: '', AmTime: '', PmTime: '', PresenceTime: '', IntensityOn: '', IntensityOff: '' }
    this.lightobject = { scheduledFlag: '', presenceFlag: '', intensityFlag: '' }
  }

  ngOnInit() {
    let type = "d";
    this.getConsumptionGraph(type)
    this.getintensityGraph(type)
    this.getphotoelectricsGraph(type)
    this.getLightTelemetryData();
    this.getStompConfig();

  }
  /**
     * Init Form group
     */
  createFormGroup() {
    this.LightingForm = new FormGroup({
      AmTime: new FormControl('', [Validators.required]),
      PmTime: new FormControl('', [Validators.required]),
      PresenceTime: new FormControl(''),
      IntensityOn: new FormControl(''),
      IntensityOff: new FormControl(''),
      Dimming: new FormControl(''),
      deviceGuid: new FormControl('')
    }, {
      validators: [this.Smartshedulevalidate]
    })
  }
  /**
     * Smart Shedule Validate
     */
  Smartshedulevalidate(c: AbstractControl): { invalid: boolean } {

    if (c.get('AmTime').value > c.get('PmTime').value) {
      return { invalid: true };
    }
  }

  /**
     * Change ConsumptionGraph By Change  Event
     * @param event
     */
  changeGraphFilter(event) {
    let type = 'd';
    if (event.value === 'Week') {
      type = 'w';
    } else if (event.value === 'Month') {
      type = 'm';
    }
    this.getConsumptionGraph(type);

  }
  /**
     * Change intensity By Change  Event
     * @param event
     */
  changeintensity(event) {
    let type = 'd';
    if (event.value === 'Week') {
      type = 'w';
    } else if (event.value === 'Month') {
      type = 'm';
    }
    this.getintensityGraph(type)

  }
  /**
     * Change Light control By Change  Event
     * @param value
     */
  onChange(value) {

    if (this.isvalid == false) {
      value.checked = false;
    }

    if (value.checked == false) {
      if ((this.LightingForm.value.AmTime != '00:00:00' && this.LightingForm.value.AmTime != "" && this.LightingForm.value.AmTime != null)
        || (this.LightingForm.value.PmTime != "" && this.LightingForm.value.PmTime != '00:00:00' && this.LightingForm.value.PmTime != null)
        || (this.LightingForm.value.PresenceTime != "" && this.LightingForm.value.PresenceTime != null)
        || (this.LightingForm.value.IntensityOn != "" && this.LightingForm.value.IntensityOn != null)
        || (this.LightingForm.value.IntensityOff != "" && this.LightingForm.value.IntensityOff != null)) {
        this.lightobject.intensityFlag = 0
        this.lightobject.scheduledFlag = 0
        this.lightobject.presenceFlag = 0
        this.deleteAlertDataModel = {
          title: "Reset Setting",
          message: this._appConstant.resetConfirm.replace('modulename', "value"),
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
            if (value.source.name == 'scheduledFlag') {
              this.scheduledFlag = false
              this.dataobj = {
                AmTime: '00:00:00',
                PmTime: '00:00:00',
                deviceGuid: this.lightGuid
              }
            } else {
              if (value.source.name == 'presenceFlag') {
                this.presenceFlag = false
                this.dataobj = {
                  PresenceTime: 0,
                  deviceGuid: this.lightGuid
                }
              } else {
                this.intensityFlag = false
                this.dataobj = {
                  IntensityOn: 0,
                  IntensityOff: 0,
                  deviceGuid: this.lightGuid
                }
              }
            }
            this.dashboardService.addLighting(this.dataobj).subscribe(response => {
              this.spinner.hide();
              if (response.isSuccess === true) {
                this.createFormGroup();
                this.getlightdetail(this.lightGuid)
              }
            })
          } else {
            if (value.source.name == 'scheduledFlag') {
              this.lightobject.scheduledFlag = 1
            } else {
              if (value.source.name == 'presenceFlag') {
                this.lightobject.presenceFlag = 1
              } else {
                this.lightobject.intensityFlag = 1
              }
            }
          }
        });

      } else {
        if (value.source.name == 'scheduledFlag' && !value.source._checked) {
          this.scheduledFlag = false;
          this.formobject.AmTime = '00:00:00';
          this.formobject.PmTime = '00:00:00';
          this.LightingForm.controls['AmTime'].disable()
          this.LightingForm.controls['PmTime'].disable()
        }
        else
          if (value.source.name == 'presenceFlag') {
            this.presenceFlag = false
            this.formobject.PresenceTime = "";
            this.LightingForm.controls['PresenceTime'].disable()
          }
          else if (value.source.name == 'intensityFlag') {
            this.intensityFlag = false
            this.formobject.IntensityOff = "";
            this.formobject.IntensityOn = "";
            this.LightingForm.controls['IntensityOff'].disable()
            this.LightingForm.controls['IntensityOn'].disable()
          }
      }
    } else {
      this.isshow = false;
      if (value.source.name == 'scheduledFlag') {
        this.selectedIndex = 0;
        this.scheduledFlag = true
        this.formobject.AmTime = '00:00:00';
        this.formobject.PmTime = '00:00:00';
        this.LightingForm.get('AmTime').setValidators([Validators.required]);
        this.LightingForm.get('PmTime').setValidators([Validators.required]);
        this.LightingForm.controls['AmTime'].reset()
        this.LightingForm.controls['PmTime'].reset()
      } else {
        if (value.source.name == 'presenceFlag') {
          this.selectedIndex = 1;
          this.presenceFlag = true
          this.formobject.PresenceTime = '';
          this.LightingForm.get('PresenceTime').setValidators([Validators.required, Validators.pattern('^[0-9 _]*$')]);
          this.LightingForm.controls['PresenceTime'].reset()
        } else {
          this.selectedIndex = 2;
          this.intensityFlag = true
          this.formobject.IntensityOff = '';
          this.formobject.IntensityOn = '';
          this.LightingForm.get('IntensityOff').setValidators([Validators.required, Validators.pattern('^[0-9 _]*$')]);
          this.LightingForm.get('IntensityOn').setValidators([Validators.required, Validators.pattern('^[0-9 _]*$')]);
          this.LightingForm.controls['IntensityOff'].reset()
          this.LightingForm.controls['IntensityOn'].reset()
        }
      }
    }

  }
  /**
     * Get Telemetry data By Light
     */
  getLightTelemetryData() {
    this.spinner.show();
    this.dashboardService.getsensorTelemetryData().subscribe(response => {
      if (response.isSuccess === true) {
        this.spinner.hide();
        let temp = [];
        this.selectedIndex = 0
        response.data.forEach((element, i) => {
          var colorNames = Object.keys(this.chartColors);
          var colorName = colorNames[i % colorNames.length];
          var newColor = this.chartColors[colorName];
          var graphLabel = {
            label: element.text,
            backgroundColor: 'rgb(153, 102, 255)',
            borderColor: newColor,
            fill: false,
            cubicInterpolationMode: 'monotone',
            data: []
          }
          temp.push(graphLabel);
        });
        this.datasets = temp;
      } else {
        if (response.message) {

          this._notificationService.add(new Notification('error', response.message));
        }
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  /**
     * Get Stom Config
     */
  getStompConfig() {

    this.deviceService.getStompConfig('LiveData').subscribe(response => {
      if (response.isSuccess) {
        this.stompConfiguration.url = response.data.url;
        this.stompConfiguration.headers.login = response.data.user;
        this.stompConfiguration.headers.passcode = response.data.password;
        this.stompConfiguration.headers.host = response.data.vhost;
        this.cpId = response.data.cpId;
        this.initStomp();
      }
    });
  }
  /**
     * Init Stom Config
     */
  initStomp() {
    let config = this.stompConfiguration;
    this.stompService.config = config;
    this.stompService.initAndConnect();
    this.stompSubscribe();
  }
  /**
     * Subscribe Topic
     */
  public stompSubscribe() {
    if (this.subscribed) {
      return;
    }

    this.messages = this.stompService.subscribe('/topic/' + this.cpId + '-' + this.uniqueId);
    this.subscription = this.messages.subscribe(this.on_next);
    this.subscribed = true;
  }
  /**
     * Get Telemetry  Data
     * @param Message
     */
  public on_next = (message: Message) => {
    let obj: any = JSON.parse(message.body);
    for (let key in obj.data.data.reporting) {
      obj.data.data.reporting[key] = (obj.data.data.reporting[key].replace(',', ''));
    }
    let reporting_data = obj.data.data.reporting
    this.isConnected = true;

    let dates = obj.data.data.time;
    let now = moment();
    if (obj.data.data.status == undefined && obj.data.msgType == 'telemetry' && obj.data.msgType != 'device' && obj.data.msgType != 'simulator') {
      this.deviceIsConnected = true;
      this.optionsdata = {
        type: 'line',
        scales: {

          xAxes: [{
            type: 'realtime',
            time: {
              stepSize: 5
            },
            realtime: {
              duration: 90000,
              refresh: 6000,
              delay: 2000,
              onRefresh: function (chart: any) {
                if (chart.height) {
                  if (obj.data.data.status != 'on') {
                    chart.data.datasets.forEach(function (dataset: any) {

                      dataset.data.push({

                        x: now,

                        y: reporting_data[dataset.label]

                      });

                    });
                  }
                } else {

                }

              },

              // delay: 2000

            }

          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'value'
            }
          }]

        },
        tooltips: {
          mode: 'nearest',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: false
        }

      }
    } else if (obj.data.msgType === 'simulator' || obj.data.msgType === 'device') {
      if (obj.data.data.status === 'off') {
        this.deviceIsConnected = false;
        this.optionsdata = {
          type: 'line',
          scales: {

            xAxes: [{
              type: 'realtime',
              time: {
                stepSize: 10
              },
              realtime: {
                duration: 90000,
                refresh: 1000,
                delay: 2000,
                //onRefresh: '',

                // delay: 2000

              }

            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'value'
              }
            }]

          },
          tooltips: {
            mode: 'nearest',
            intersect: false
          },
          hover: {
            mode: 'nearest',
            intersect: false
          }

        };
      } else {
        this.deviceIsConnected = true;
      }
    }
    obj.data.data.time = now;

  }
  /**
     * Change Photoelectrics by event
     * @param event
     */
  changephotoelectrics(event) {
    let type = 'd';
    if (event.value === 'Week') {
      type = 'w';
    } else if (event.value === 'Month') {
      type = 'm';
    }
    this.getphotoelectricsGraph(type)

  }
  /**
     * Consumption Graph by type
     * @param type
     */
  getConsumptionGraph(type) {
    this.spinner.show();
    var data = {
      "deviceguid": this.lightGuid,
      "frequency": type
    }
    this.dashboardService.getLightingGraph(data).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        let data = [];
        if (response.data.length) {
          data.push(['Months', 'Consumption'])

          response.data.forEach(element => {
            data.push([element.name, parseFloat(element.energyConsumption)])
          });
        }
        this.lineChartData = {
          chartType: 'LineChart',
          dataTable: data,
          options: {
            title: '',
            // width: '100%',
            height: 350,
            interpolateNulls: true,
            hAxis: {
              title: '',
              gridlines: {
                count: 5
              },
            },
            vAxis: {
              title: 'KW',
              gridlines: {
                count: 5
              },
            },
            legend: 'none',
            chartArea: { width: '85%' }
          },
        }
      }
      else {
        this.lineChartData.dataTable = [];
        this._notificationService.add(new Notification('error', response.message));

      }
    }, error => {
      this.lineChartData.dataTable = [];
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  /**
     * Clear Form
     */
  cleardata() {
    this.createFormGroup();
  }
  /**
    * Light Detail by Lightguid
    * @param Lightguid
    */
  getlightdetail(Lightguid) {
    this.spinner.show();
    this.dashboardService.getlightdetail(Lightguid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true && response.data != '') {
        this.lightobject = response.data;
        this.scheduledFlag = response.data.scheduledFlag
        this.presenceFlag = response.data.presenceFlag
        this.intensityFlag = response.data.intensityFlag
        this.uniqueId = response.data.uniqueId
        this.lightstatus();
        this.capacity = response.data.capacity
        this.entityName = response.data.entityName
        this.templateName = response.data.templateName
        if (this.scheduledFlag == false && this.presenceFlag == false && this.intensityFlag == false) {
          this.lightobject.scheduledFlag = true
          this.scheduledFlag = true
          this.isvalid = false;
        }
        if (this.lightobject.scheduledFlag == true) {
          this.isvalid = true;
        }
        if (response.data.intensityFlag === true || response.data.presenceFlag === true || response.data.scheduledFlag === true) {
          this.dashboardService.getsettingdetail(Lightguid).subscribe(response => {
            this.buttonname = 'Update'
            this.isEdit = true;
            this.formobject.AmTime = response.data.amTimeValue;
            this.formobject.PmTime = response.data.pmTimeValue;
            this.formobject.PresenceTime = response.data.presenceTime;
            this.formobject.IntensityOff = response.data.intensityOn;
            this.formobject.IntensityOn = response.data.intensityOff;
            this.sliderValue = response.data.dimming
            this.LightingForm.get('AmTime').setValue(response.data.amTime);
            this.LightingForm.get('PmTime').setValue(response.data.pmTime);
            this.LightingForm.get('PresenceTime').setValue(response.data.presenceTime);
            this.LightingForm.get('IntensityOff').setValue(response.data.intensityOff);
            this.LightingForm.get('IntensityOn').setValue(response.data.intensityOn);
          })
        }

      }
    });
  }
  /**
   * Light On Off Status
   * @param uniqueId
   */
  lightstatus() {
    this.spinner.show();
    this.dashboardService.connectionstatus(this.uniqueId).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true && response.data != '') {
        this.deviceIsConnected = response.data.isConnected
      }
    })
  }
  /**
     * Get intensity Graph
     * @param type
     */
  getintensityGraph(type) {
    this.spinner.show();
    var data = {
      "deviceguid": this.lightGuid,
      "frequency": type
    }
    this.dashboardService.getintensityGraph(data).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        let data = [];
        if (response.data.length) {
          data.push(['', ''])

          response.data.forEach(element => {
            data.push([element.name, parseFloat(element.energyConsumption)])
          });
        }
        this.intensityChartData = {
          chartType: 'LineChart',
          dataTable: data,
          options: {
            width: '100%',
            height: 350,
            interpolateNulls: true,
            hAxis: {
              title: '',
              gridlines: {
                count: 5
              },
            },
            vAxis: {
              title: 'illumination',
              gridlines: {
                count: 5
              },
            },
            legend: 'none',
            chartArea: { width: '85%' }
          },
        }
      }
      else {
        this.lineChartData.dataTable = [];
        this._notificationService.add(new Notification('error', response.message));

      }
    }, error => {
      this.lineChartData.dataTable = [];
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  /**
     * Get Photo Electrics Graph
     * @param type
     */
  getphotoelectricsGraph(type) {
    this.spinner.show();
    var data = {
      "deviceguid": this.lightGuid,
      "frequency": type
    }
    this.dashboardService.getphotoelectricsGraph(data).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        let data = [];
        if (response.data.length) {
          data.push(['Months', 'Lux'])

          response.data.forEach(element => {
            data.push([element.name, parseFloat(element.energyConsumption)])
          });
        }
        this.photoelectricsChartData = {
          chartType: 'LineChart',
          dataTable: data,
          options: {
            title: '',
            width: '100%',
            height: 350,
            interpolateNulls: true,
            hAxis: {
              title: '',
              gridlines: {
                count: 5
              },
            },
            vAxis: {
              title: 'Lux',
              gridlines: {
                count: 5
              },
            },
            legend: 'none',
            chartArea: { width: '85%' }
          },
        }
      }
      else {
        this.lineChartData.dataTable = [];
        this._notificationService.add(new Notification('error', response.message));

      }
    }, error => {
      this.lineChartData.dataTable = [];
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  /**
     * Add Light Control
     */
  manageLighting() {
    this.checkSubmitStatus = true;
    if (this.LightingForm.status === "VALID") {
      this.LightingForm.get('deviceGuid').setValue(this.lightGuid);
      this.dashboardService.addLighting(this.LightingForm.value).subscribe(response => {
        this.spinner.hide();
        if (response.isSuccess === true) {
          this.getlightdetail(this.lightGuid)
          if (this.isEdit) {
            this._notificationService.add(new Notification('success', " Light control saved successfully."));
          } else {
            this._notificationService.add(new Notification('success', "Light control saved successfully."));
          }
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      });
    }
  }
}
