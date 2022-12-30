
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, map } from 'rxjs';
import { AuthService, User } from '../auth.service';
import { ItemService, Post } from '../item.service';
import { MatInputPromptComponent } from '../mat-input-prompt/mat-input-prompt.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dataFromDialog: any;
  toggleForm: boolean = false;
  state: boolean = true;
  posts: Post[] = [];

  nameForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)], this.asyncValidator.bind(this)),
    photo: new FormControl(''),
    bio: new FormControl('')
  })

  activeUser: any;

  constructor(
    private dialog: MatDialog,
    private itemService: ItemService,
    private authService: AuthService,
    private afs: AngularFirestore,
    ) {}

  ngOnInit(): void {  
    this.itemService.getAllPosts()
    .pipe(map((res) => {
      const posts = [];
      for (const key in res) {
        if (res.hasOwnProperty(key)) {
          posts.push({ ...res[key], id: key })
        }
      }
      return posts;
    }))
    .subscribe((data) => {
      this.posts = data;
    })
    
    this.afs.collection('users').doc(localStorage.getItem('id')!).valueChanges().subscribe(res =>  {this.activeUser = res}) 
  }

  onPostCreate() {
    const dialogRef = this.dialog.open(MatInputPromptComponent, {
      width: '700px',
      height: '450px',
    });

    dialogRef.afterClosed().subscribe((data) => {
      this.dataFromDialog = data.form;
    });
  }

  updateProfile() {
    this.authService.updateProfile(
      this.nameForm.get('name')?.value,
      this.nameForm.get('photo')?.value,
      this.nameForm.get('bio')?.value
    )
    this.toggleForm = !this.toggleForm;
  }

  fetchData() {
    this.afs.collection('users').doc<User>(localStorage.getItem('id')).get().subscribe((res:any) => {     
      this.nameForm.get('name')?.setValue(res.data()?.displayName),
      this.nameForm.get('photo')?.setValue(res.data()?.photoURL),
      this.nameForm.get('bio')?.setValue(res.data()?.bio)
    })
    
  }

  asyncValidator() {
    return new Promise(resolve => {
      this.check_displayName().then(snapshot => {
        if(snapshot.docs.length > 0 && this.activeUser.displayName !== this.nameForm.get('name')?.value){
          resolve({
            "displayNameTaken": true
          });
        } else {
          resolve(null);
        }
      })
    })
  }

  check_displayName() {
    return firstValueFrom(this.afs.collection('users', ref => ref.where('displayName', '==', this.nameForm.get('name').value)).get());
  }

  onDeletePost(post: Post, e: Event) {
    this.itemService.deletePost(post).subscribe();
    e.stopPropagation();
  }

  onEditPost(post: Post, e: Event) {
    const dialogRef = this.dialog.open(MatInputPromptComponent, {
      width: '700px',
      height: '450px',
    });
    this.itemService.itemToEdit.next(post)

    dialogRef.afterClosed().subscribe((data) => {
      this.dataFromDialog = data.form;
      post.isEdited = true;
    });

    e.stopPropagation();
  }

}
