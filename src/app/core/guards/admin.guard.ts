import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  activeUser: any;
  
  constructor(
    public authService: AuthService,
    private afs: AngularFirestore,
    public router: Router,
    private toast: ToastService
  ){
  
  }
  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
   if(!localStorage.getItem('id')){
    this.router.navigate(['/login'])
    this.toast.warn('Please Login with your credentials!');
    return false
   }else 
    this.afs.collection('users')
      .doc(localStorage.getItem('id')!)
      .get()
      .subscribe((res: any) => {
        if(res.data().role === 'admin'){
          return true
        } else {
          this.toast.warn('This section is prohibit for Users!');
          this.router.navigate(['/blog'])
        }        
      })
    return true;
  }

  
  
}
