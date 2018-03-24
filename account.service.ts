import { CookieService } from './cookie.service';
import { DataService } from './data.service';

import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class AccountService {
	private token: string | boolean = this.cookieService.get('token');
	private isLoggedIn: boolean = this.token != false;

	constructor(
		private http: Http,
		private dataService: DataService,
		private cookieService: CookieService
	) { }

	isAuthorized(): boolean {
		return this.isLoggedIn;
	}

	updateToken() {
		this.token = this.cookieService.get('token');
		this.dataService.updateHeader();
		this.isLoggedIn = this.token != false;
	}
}