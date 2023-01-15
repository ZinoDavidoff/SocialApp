import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

export interface User {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLogged: boolean;
  isRegister: boolean;
  isNotLogged: boolean;
  isNotRegister: boolean;
  
  constructor(
    private fireauth: AngularFireAuth,
    private afs: AngularFirestore, 
    private router: Router
    ) {

    }

    get isLoggedIn(): boolean {
      const user = localStorage.getItem('id');
      return (user !== null) ? true : false;
    }

    login(email : string, password : string) {
      this.fireauth.signInWithEmailAndPassword(email,password).then((result) => {
        this.SetUserData(result.user)
        this.isLogged = true;
        setTimeout(()=> this.isLogged = false, 1500)
        localStorage.setItem('id', result.user?.uid!)
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      }, err => {
          console.log(err.message);
          this.isNotLogged = true;
          setTimeout(()=> this.isNotLogged = false, 1500)
      })
    }

   register(email : string, password : string) {
      this.fireauth.createUserWithEmailAndPassword(email, password).then((result) => {
        localStorage.setItem('id', result.user?.uid!)
        this.SetUserData(result.user)
        this.isRegister = true;
        setTimeout(()=> this.isRegister = false, 1500)
      }, err => {
        console.log(err.message);
        this.isNotRegister = true;
        setTimeout(()=> this.isNotRegister = false, 1500)
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

 updateProfile(displayName: string, photoURL: string, bio: string, role: string) {
    this.afs.collection('users').doc(localStorage.getItem('id')!).update({
      displayName: displayName,
      photoURL: photoURL || '', 
      bio: bio || '', 
      role: role || ''
    })
  }

    logOut() {
      this.fireauth.signOut().then(() => {
        localStorage.clear()
        this.router.navigate(['/login'])
      }, err => {
        alert(err.message);
      })
    }

}
