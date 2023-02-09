import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { User } from '../models/interfaces';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(
    private fireauth: AngularFireAuth,
    private afs: AngularFirestore, 
    private router: Router,
    private toast: ToastService
    ) {
      
    }

    get isLoggedIn(): boolean {
      const user = localStorage.getItem('id');
      return (user !== null) ? true : false;
    }

    login(email : string, password : string) {
      this.fireauth.signInWithEmailAndPassword(email,password).then((result) => {
        this.SetUserData(result.user)
        localStorage.setItem('id', result.user?.uid!)
        this.toast.success('You have successfully logged in!');
          this.router.navigate(['/dashboard']);
      }, err => {
        this.toast.danger(err.message);
      })
    }

   register(email : string, password : string) {
      this.fireauth.createUserWithEmailAndPassword(email, password).then((result) => {
        localStorage.setItem('id', result.user?.uid!)
        this.SetUserData(result.user)
        this.toast.success('You have successfully registered!');
      }, err => {
        this.toast.danger(err.message);
      })
    }

    SetUserData(user: User) {
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(
        `users/${user.uid}`
      );
      const userData: User = {
        uid: user.uid,
        email: user.email
      };
      return userRef.set(userData, {
        merge: true,
      });
      
    }

 updateProfile(displayName: string, photoURL: string, bio: string) {
    this.afs.collection('users').doc(localStorage.getItem('id')!).update({
      displayName: displayName,
      photoURL: photoURL || '', 
      bio: bio,
      role: 'user'
    })
  }

    logOut() {
      this.fireauth.signOut().then(() => {
        localStorage.clear()
        this.toast.info('You have successfully logged out!'      
        );
        this.router.navigate(['/login'])
      }, err => {
        this.toast.danger(err.message);
      })
    }
}
