import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { SelectivePreloadingStrategy } from './selective-preloading-strategy'
import { PageNotFoundComponent } from './page-not-found.component'
import {
	CallbackComponent,HomeComponent, UserListComponent, UserAddComponent, DashboardComponent,
	LoginComponent, RegisterComponent, MyProfileComponent, ResetpasswordComponent, SettingsComponent,
	ChangePasswordComponent, AdminLoginComponent, SubscribersListComponent, HardwareListComponent, HardwareAddComponent,
	UserAdminListComponent, AdminUserAddComponent, AdminDashboardComponent, SubscriberDetailComponent, LightAddComponent,
	BulkuploadAddComponent, LightListComponent, RolesListComponent, RolesAddComponent,
	AddNewbuildingComponent,
	BuildingDashboardComponent, ScheduledMaintenanceListComponent, ScheduledMaintenanceAddComponent,
	BuildingListComponent, AlertsComponent, NotificationsComponent, LightDashboardComponent,
} from './components/index'


import { AuthService, AdminAuthGuard } from './services/index'
import { DynamicDashboardComponent } from './components/dynamic-dashboard/dynamic-dashboard/dynamic-dashboard.component'




const appRoutes: Routes = [
	{
		path: 'admin',
		children: [
			{
				path: '',
				component: AdminLoginComponent
			},
			{
				path: 'dashboard',
				component: AdminDashboardComponent,
				canActivate: [AuthService]
			},
			{
				path: 'subscribers/:email/:productCode/:companyId',
				component: SubscriberDetailComponent,
				canActivate: [AuthService]
			},
			{
				path: 'subscribers',
				component: SubscribersListComponent,
				canActivate: [AuthService]
			},
			{
				path: 'hardwarekits',
				component: HardwareListComponent,
				canActivate: [AuthService]
			},
			{
				path: 'hardwarekits/bulkupload',
				component: BulkuploadAddComponent,
				canActivate: [AuthService]
			},
			{
				path: 'hardwarekits/addhardwarekit',
				component: HardwareAddComponent,
				canActivate: [AuthService]
			},
			{
				path: 'hardwarekits/:hardwarekitGuid',
				component: HardwareAddComponent,
				canActivate: [AuthService]
			},
			{
				path: 'users',
				component: UserAdminListComponent,
				canActivate: [AuthService]
			},
			{
				path: 'users/adduser',
				component: AdminUserAddComponent,
				canActivate: [AuthService]
			},
			{
				path: 'users/:userGuid',
				component: AdminUserAddComponent,
				canActivate: [AuthService]
			}
		]
	},
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'callback',
		component: CallbackComponent
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'register',
		component: RegisterComponent
	},
	//App routes goes here 
	{
		path: 'my-profile',
		component: MyProfileComponent,
		//canActivate: [AuthService]
	},
	{
		path: 'change-password',
		component: ChangePasswordComponent,
		//canActivate: [AuthService]
	},
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [AdminAuthGuard]
	},

	{
		path: 'notifications',
		component: NotificationsComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'lights',
		component: LightListComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'lights/light-dashboard/:lightGuid',
		component: LightDashboardComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'lights/add',
		component: LightAddComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'lights/:lightGuid',
		component: LightAddComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'alerts',
		component: AlertsComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'alerts/:buildingGuid',
		component: AlertsComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'users',
		component: UserListComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'users/:userGuid',
		component: UserAddComponent,
		canActivate: [AdminAuthGuard]
	}, {
		path: 'users/add',
		component: UserAddComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'roles/:roleGuid',
		component: RolesAddComponent,
		canActivate: [AdminAuthGuard]
	}, {
		path: 'roles',
		component: RolesListComponent,
		canActivate: [AdminAuthGuard]
	},

	{
		path: 'buildings',
		component: BuildingListComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'buildings/building-dashboard/:buildingGuid',
		component: BuildingDashboardComponent,
		pathMatch: 'full',
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'buildings/:buildingGuid',
		component: AddNewbuildingComponent,
		canActivate: [AdminAuthGuard]
	}, {
		path: 'buildings/add',
		component: AddNewbuildingComponent,
		canActivate: [AdminAuthGuard]
	},

	{
		path: 'maintenance',
		component: ScheduledMaintenanceListComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'maintenance/add',
		component: ScheduledMaintenanceAddComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'maintenance/:guid',
		component: ScheduledMaintenanceAddComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: 'dynamic-dashboard',
		component: DynamicDashboardComponent,
		canActivate: [AdminAuthGuard]
	},
	{
		path: '**',
		component: PageNotFoundComponent
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(
			appRoutes, {
			preloadingStrategy: SelectivePreloadingStrategy
		}
		)
	],
	exports: [
		RouterModule
	],
	providers: [
		SelectivePreloadingStrategy
	]
})

export class AppRoutingModule { }
