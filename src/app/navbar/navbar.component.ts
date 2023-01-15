import { Component, DoCheck, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, DoCheck {

  activeUser: any;
  toggle: boolean;
  
  constructor(private auth: AuthService, private afs: AngularFirestore) { }

  ngDoCheck(): void {
    if (localStorage.getItem('id') != null) {
      this.toggle = true;
    } else {
      this.toggle = false;
    }
  }

  ngOnInit(): void {
    this.afs.collection('users')
    .doc(localStorage.getItem('id')!)
    .valueChanges()
    .subscribe(res => {
      this.activeUser = res;
    })
  }

  logOut() {
    this.auth.logOut()
  }

}
