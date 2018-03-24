import { Injectable } from '@angular/core';
import { Http, RequestOptions, Response, Headers } from '@angular/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { CookieService } from './cookie.service';

import { ISegment } from './shared/segments/i-segment';

@Injectable()
export class DataService {
	private url: string = "https://api.sintez.online";
	private headers = new Headers();
	private version = "v1";

	limit: number = 10;

	public serverNotAvailable: boolean = false;

	constructor(
		private http: Http,
		private router: Router,
		private cookieService: CookieService
	) {
		this.updateHeader();
	}

	updateHeader() {
		if (this.cookieService.get('token'))
			this.headers.append('SINTEZ-ApiToken', this.cookieService.get('token').toString());
	}

	getToken(email: string, password: string): Observable<any> {	
		return this.http.get(this.url + "/" + this.version + "/user/generateAPIToken?email=" + email + "&password=" + password)
			.map(res => res.json() as any);
	}

	error(err) {
		if (err.status == 401) {
			this.cookieService.delete('token');
			window.open("/", "_self");
		}

		if (err.status == 0 || err.status == 504)
			this.serverNotAvailable = true;

		return Observable.throw(err);
	}

	getContacts(offset: number, segment?: ISegment | undefined): Observable<any> { // "| any" убрать после fix'a фильтрации в real time
		let segmentStr = (segment && segment.id != -1) ? ("&segment=" + segment.id) : "",
			options = new RequestOptions({ headers: this.headers });

		if (segment && segment.unsaved) {
			let body = JSON.stringify({
				name: "new segment",
				filter: segment.filterFromServer,
				group: "main",
				company: 58,
				startYearNum: 0,
				startMonthNum: 0,
				endYearNum: 0,
				endMonthNum: 0,
				lastState: true,
				limit: 3
			});

			return this.http.post(this.url + "/" + this.version + "/contact", body, options)
				.map(res => res.json() as any)
				.map(res => {
					if (res.length)
						for (let contact of res) {
							contact.properties = new Object();

							for (let property of contact.contactProperty)
								contact.properties[property.type.name] = property.value;
						}

					return res;
				})
				.catch(err => this.error(err));
		}
		else {
			return this.http.get(this.url + "/" + this.version + "/contact?limit=" + this.limit + "&offset=" + offset + segmentStr, options)
				.map(res => res.json() as any)
				.map(res => {
					if (res.length)
						for (let contact of res) {
							contact.properties = new Object();

							for (let property of contact.contactProperty)
								contact.properties[property.type.name] = property.value;
						}

					return res;
				})
				.catch(err => this.error(err));
		}
	}


	getSegments(): Observable<any[]> {
		let options = new RequestOptions({ headers: this.headers });

		return this.http.get(this.url + "/" + this.version + "/segment", options)
			.map(res => res.json() as any)
			.catch(err => this.error(err));
	}

	getContactPropertyTypes(): Observable<any[]> {
		let options = new RequestOptions({ headers: this.headers });

		return this.http.get(this.url + "/" + this.version + "/contact-property-type", options)
			.map(res => res.json() as any)
			.catch(err => this.error(err));
	}

	getContactEventTypes(): Observable<any[]> {
		let options = new RequestOptions({ headers: this.headers });

		return this.http.get(this.url + "/" + this.version + "/contact-event-type", options)
			.map(res => res.json() as any)
			.catch(err => this.error(err));
	}

	getContactPropertyType(id: number): Observable<any[]> {
		let options = new RequestOptions({ headers: this.headers });

		return this.http.get(this.url + "/" + this.version + "/contact-property-type/" + id, options)
			.map(res => res.json() as any)
			.catch(err => this.error(err));
	}

	getContactEventType(id: number): Observable<any[]> {
		let options = new RequestOptions({ headers: this.headers });

		return this.http.get(this.url + "/" + this.version + "/contact-event-type/" + id, options)
			.map(res => res.json() as any)
			.catch(err => this.error(err));
	}

	addSegment(segment: any): Observable<any[]> {
		let options = new RequestOptions({ headers: this.headers });
		
		return this.http.post(this.url + "/" + this.version + "/segment", JSON.stringify(segment), options)
			.catch(err => this.error(err));
	}

	changeSegment(segment: any): Observable<any[]> {
		let options = new RequestOptions({ headers: this.headers });
		segment.filter = segment.filterFromServer;

		return this.http.put(this.url + "/" + this.version + "/segment/" + segment.id, segment, options)
			.catch(err => this.error(err));
	}

	deleteSegment(id: number): Observable<any[]> {
		let options = new RequestOptions({ headers: this.headers });

		return this.http.delete(this.url + "/" + this.version + "/segment/" + id, options)
			.catch(err => this.error(err));
	}
}