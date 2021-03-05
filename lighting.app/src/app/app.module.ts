import { BrowserModule } from '@angular/platform-browser'
import { NgModule, APP_INITIALIZER } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators'
import { HttpModule } from '@angular/http'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { NgxSpinnerModule } from 'ngx-spinner'
import { CookieService } from 'ngx-cookie-service'
import { SocketIoConfig, SocketIoModule } from 'ng-socket-io'
import { NgxPaginationModule } from 'ngx-pagination'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { TagInputModule } from 'ngx-chips'
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE, OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime'
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment'
import { MatButtonModule, MatCheckboxModule, MatInputModule, MatProgressBarModule, MatSelectModule, MatSlideToggleModule, MatTabsModule, MatRadioModule } from '@angular/material'
import { Ng2GoogleChartsModule } from 'ng2-google-charts'
import { FullCalendarModule } from '@fullcalendar/angular'
import { AgmCoreModule } from '@agm/core'
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer'
import { AgmDirectionModule } from 'agm-direction'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { PageNotFoundComponent } from './page-not-found.component'
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatTableModule } from '@angular/material/table'
import {
	MatDialogModule, MatIconModule, MatPaginatorModule,
	MatCardModule, MatTooltipModule, MatSortModule, MatDatepickerModule, MatNativeDateModule
} from '@angular/material'

import { JwtInterceptor } from './helpers/jwt.interceptor';

import { TextMaskModule } from 'angular2-text-mask';
import { AppConstant } from './app.constants';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ClickOutsideModule } from 'ng-click-outside';
import { GaugeChartModule } from 'angular-gauge-chart';
// import custom pipes
import { ShortNumberPipe } from './helpers/pipes/short-number.pipe';
import { ReplacePipe } from './helpers/pipes/replace.pipe';
import { ShortNumberFixnumberPipe } from './helpers/pipes/short-number-fixnumber.pipe';

import { ChartsModule } from 'ng2-charts';

import {
	CallbackComponent, MessageDialogComponent, AddNewbuildingComponent, BuildingDashboardComponent, BuildingListComponent
	, PaymentComponent, PurchasePlanComponent, RegisterComponent, BulkuploadAddComponent, AdminDashboardComponent, AdminLoginComponent, HomeComponent, UserListComponent, UserAddComponent,
	FlashMessageComponent, ConfirmDialogComponent, DashboardComponent,
	DeleteDialogComponent, ExtendMeetingComponent, FooterComponent,
	HeaderComponent, LoginHeaderComponent, LoginFooterComponent, LeftMenuComponent, LoginComponent,
	PageSizeRenderComponent, PaginationRenderComponent, ResetpasswordComponent, LightListComponent, LightAddComponent,
	SearchRenderComponent, SettingsComponent, MyProfileComponent, ChangePasswordComponent, SubscribersListComponent, HardwareListComponent, HardwareAddComponent, UserAdminListComponent,
	AdminUserAddComponent, SubscriberDetailComponent,
	RolesListComponent, RolesAddComponent, AlertsComponent,
	NotificationsComponent, LightDashboardComponent, ScheduledMaintenanceListComponent, ScheduledMaintenanceAddComponent
	,DynamicDashboardComponent,
	WidgetCounterAComponent,
	WidgetCounterBComponent,
	WidgetCounterCComponent,
	WidgetCounterDComponent,
	WidgetCounterEComponent,
	WidgetCounterFComponent,
	WidgetAlertAComponent,
	WidgetMapAComponent,
	WidgetChartAComponent,
	WidgetChartBComponent,
	SizeDetectorComponent

} from './components/index'

import {
	BuildingService, ApiConfigService, AuthService, UserService, NotificationService, AdminAuthGuard,
	DashboardService, DeviceService, RolesService, SettingsService, LightService,
	ConfigService, LookupService, SubscriptionService, LocationService, ScheduledMaintenanceService,
	DynamicDashboardService
} from './services/index';
import { TooltipDirective } from './helpers/tooltip.directive';
import { NgSelectModule } from '@ng-select/ng-select';

import { ProgressBarModule } from 'angular-progress-bar';
import { SlickCarouselModule } from 'ngx-slick-carousel';

/*Dynamic Dasboard Code*/
import { GridsterModule } from 'angular-gridster2';
import { ColorPickerModule } from 'ngx-color-picker';
import {MatSliderModule} from '@angular/material/slider'; 
import { Ng5SliderModule } from 'ng5-slider';
/*Dynamic Dasboard Code*/

const config: SocketIoConfig = { url: 'http://localhost:2722', options: {} };
const MY_NATIVE_FORMATS = {
	parseInput: 'DD-MM-YYYY',
	fullPickerInput: 'DD-MM-YYYY hh:mm a',
	datePickerInput: 'DD-MM-YYYY',
	timePickerInput: 'HH:mm',
	monthYearLabel: 'MMM-YYYY',
	dateA11yLabel: 'HH:mm',
	monthYearA11yLabel: 'MMMM-YYYY'
};
export function initializeApp(appConfigService: ApiConfigService) {
	return (): Promise<any> => {
		return appConfigService.load();
	}
}

@NgModule({
	declarations: [
		AppComponent,
		PageNotFoundComponent,
		LoginComponent,
		HeaderComponent,
		LoginHeaderComponent,
		LoginFooterComponent,
		FooterComponent,
		LeftMenuComponent,
		ExtendMeetingComponent,
		DashboardComponent,
		PageSizeRenderComponent,
		PaginationRenderComponent,
		SearchRenderComponent,
		ConfirmDialogComponent,
		DeleteDialogComponent,
		ResetpasswordComponent,
		SettingsComponent,
		FlashMessageComponent,
		UserListComponent,
		UserAddComponent,
		MyProfileComponent,
		ChangePasswordComponent,
		HomeComponent,
		ShortNumberPipe,
		ReplacePipe,
		ShortNumberFixnumberPipe,
		AdminLoginComponent,
		AdminDashboardComponent,
		SubscribersListComponent,
		HardwareListComponent,
		HardwareAddComponent,
		UserAdminListComponent,
		AdminUserAddComponent,
		BulkuploadAddComponent,
		SubscriberDetailComponent,
		TooltipDirective,
		RegisterComponent,
		PurchasePlanComponent,
		PaymentComponent,
		LightListComponent,
		RolesListComponent,
		RolesAddComponent,
		LightAddComponent,
		MessageDialogComponent,
		AlertsComponent,
		NotificationsComponent,
		LightDashboardComponent,
		AddNewbuildingComponent,
		BuildingDashboardComponent,
		BuildingListComponent,
		ScheduledMaintenanceListComponent,
		ScheduledMaintenanceAddComponent,
		CallbackComponent,
		DynamicDashboardComponent,
		WidgetCounterAComponent,
		WidgetCounterBComponent,
		WidgetCounterCComponent,
		WidgetCounterDComponent,
		WidgetCounterEComponent,
		WidgetCounterFComponent,
		WidgetAlertAComponent,
		WidgetMapAComponent,
		WidgetChartBComponent,
		WidgetChartAComponent,
		/*WidgetChartAComponent,
		WidgetChartBComponent,
		WidgetChartCComponent,
		WidgetChartDComponent,
		WidgetUseCaseSpecificAComponent,*/
		SizeDetectorComponent

	],
	entryComponents: [DeleteDialogComponent, MessageDialogComponent],
	imports: [
		MatSelectModule,
		MatRadioModule,
		MatButtonModule,
		MatCheckboxModule,
		MatTabsModule,
		MatProgressBarModule,
		MatSlideToggleModule,
		MatInputModule,
		MatSidenavModule,
		MatTableModule,
		MatDialogModule,
		MatIconModule,
		MatPaginatorModule,
		MatSortModule,
		MatCardModule,
		MatTooltipModule,
		BrowserModule,
		TagInputModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
		AppRoutingModule,
		HttpModule,
		HttpClientModule,
		NgxSpinnerModule,
		NgxPaginationModule,
		OwlDateTimeModule,
		Ng2GoogleChartsModule,
		OwlNativeDateTimeModule,
		FullCalendarModule,
		SocketIoModule.forRoot(config),
    AgmCoreModule.forRoot({ apiKey: '--GOOGLE MAP API KEY--' }),
		AgmJsMarkerClustererModule,
		AgmDirectionModule,
		TextMaskModule,
		NgScrollbarModule,
		ClickOutsideModule,
		ChartsModule,
		NgSelectModule,
		GaugeChartModule,
		ProgressBarModule,
		SlickCarouselModule,
		MatDatepickerModule,
		MatNativeDateModule,
		NgxMaterialTimepickerModule,
		GridsterModule,
		ColorPickerModule,
		MatSliderModule,
		Ng5SliderModule
	],
	providers: [
		AuthService,
		AdminAuthGuard,
		SettingsService,
		CookieService,
		DeviceService,
		RolesService,
		DashboardService,
		ConfigService,
		NotificationService,
		UserService,
		LookupService,
		SubscriptionService,
		LocationService,
		ApiConfigService,
		BuildingService,
		ScheduledMaintenanceService,
		LightService,
		DynamicDashboardService,
		AppConstant,
		{
			provide: DateTimeAdapter,
			useClass: MomentDateTimeAdapter,
			deps: [OWL_DATE_TIME_LOCALE]
		}, {
			provide: OWL_DATE_TIME_FORMATS,
			useValue: MY_NATIVE_FORMATS
		}, {
			provide: HTTP_INTERCEPTORS,
			useClass: JwtInterceptor,
			multi: true
		},
		{ provide: APP_INITIALIZER, useFactory: initializeApp, deps: [ApiConfigService], multi: true }
	],
	bootstrap: [AppComponent]
})

export class AppModule { }
