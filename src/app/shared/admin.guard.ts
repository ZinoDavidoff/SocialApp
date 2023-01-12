import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    public authService: AuthService,
    public router: Router,
    public location: Location
  ){}
  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if(localStorage.getItem('id') !== 'ImYgLoVkqjfzzsOdtYRZ30V7uUH3') {
      alert('You are non allowed to navigate to this section');
      this.location.back();
    }
    return true;
  }
  
}
