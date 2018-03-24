import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AccountService } from './account.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private accountService: AccountService, private router: Router) { }
	
	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		if (!this.accountService.isAuthorized())
			this.router.navigate(['/login']);

		return this.accountService.isAuthorized();
	}
}