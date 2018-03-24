import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ContainerComponent } from './views/container/container.component';
import { LoginComponent } from './views/login/login.component';
import { ProfileComponent } from './views/profile/profile.component';
import { OnlineComponent } from './views/online/online.component';
import { CallsComponent } from './views/calls/calls.component';
import { DialoguesComponent } from './views/dialogues/dialogues.component';
import { ContactsComponent } from './views/contacts/contacts.component';
import { MailingComponent } from './views/mailing/mailing.component';
import { ChainComponent } from './views/chain/chain.component';
import { StatsComponent } from './views/stats/stats.component';
import { CompanyComponent } from './views/company/company.component';

import { AuthGuard } from './auth.guard';

const routes: Routes = [
	{
		path: '',
		redirectTo: '/online',
		pathMatch: 'full'
	},

	{
		path: '',
		children: [
			{ path: 'login', component: LoginComponent },
			{ path: 'profile', canActivate: [AuthGuard], component: ProfileComponent },
			{ path: 'mailing', canActivate: [AuthGuard], component: MailingComponent },
			{ path: 'chain', canActivate: [AuthGuard], component: ChainComponent },
			{ path: 'stats', canActivate: [AuthGuard], component: StatsComponent },
			{ path: 'company', canActivate: [AuthGuard], component: CompanyComponent }
		]
	},

	{
		path: '',
		canActivate: [AuthGuard],
		component: ContainerComponent,
		children: [
			{ path: 'online', component: OnlineComponent },
			{ path: 'calls', component: CallsComponent },
			{ path: 'dialogues', component: DialoguesComponent },
			{ path: 'contacts', component: ContactsComponent },
		]
	}
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})

export class AppRoutingModule { }