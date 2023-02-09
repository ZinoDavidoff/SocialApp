import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    public authService: AuthService,
    public router: Router,
    private toast: ToastService
  ){}
  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    // this.afAuth.authState.subscribe(user => {
    //   console.log('here', user.uid)
    // });
    if(localStorage.getItem('id') !== 'ImYgLoVkqjfzzsOdtYRZ30V7uUH3') {
      this.toast.danger('This section is prohibited!');
        this.router.navigate(['/blog'])
    }
    return true;
  }

  
  
}
