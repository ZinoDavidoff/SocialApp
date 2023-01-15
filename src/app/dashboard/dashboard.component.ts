
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, delay, firstValueFrom, map, Observable, Subject, Subscription } from 'rxjs';
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
  userRole: 'user';
  posts: Post[] = [];

  nameForm = new FormGroup({
    name: new FormControl(
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(19)], 
      this.asyncValidator.bind(this)),
    photo: new FormControl(''),
    bio: new FormControl('')
  })

  activeUser: any | undefined;
  showspinner: boolean;

  constructor(
    private dialog: MatDialog,
    private itemService: ItemService,
    private authService: AuthService,
    private afs: AngularFirestore
  ) { }

  ngOnInit(): void { 

    this.showspinner = true;

    this.itemService.getAllPosts().pipe(delay(1000))
      .subscribe((data) => {
        this.posts = data;
        this.showspinner = false;
        for (let post of this.posts) {
          post.toggleButtonLike = true;
            if (post.likes) {
              for (let like of post.likes) {
                if (like.displayName === this.activeUser?.displayName) {
                  post.toggleButtonLike = false;
                }
              }
            } else {
              post.toggleButtonLike = true;
            }
        }
      })

    this.itemService.post$.subscribe((post: Post) => {
      
      for (let pos of this.posts) {
        if (pos.id === post.id) {
          let index = this.posts.findIndex(p => p.id === pos.id)
          this.posts[index] = post;
        } else {
          this.posts.push(post);
        }
      }
      
      this.itemService.getAllPosts().subscribe(
        (post) => {
          this.posts = post;
          for (let post of this.posts) {
            post.toggleButtonLike = true;
              if (post.likes) {
                for (let like of post.likes) {
                  if (like.displayName === this.activeUser?.displayName!) {
                    post.toggleButtonLike = false;
                  }
                }
              } else {
                post.toggleButtonLike = true;
              }
          }
        })
    })

    this.afs.collection('users').doc(localStorage.getItem('id')!).valueChanges().subscribe((res: any) => {
      this.activeUser = res
    })
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
    setTimeout(() => {
      this.authService.updateProfile(
        this.nameForm.get('name')?.value,
        this.nameForm.get('photo')?.value,
        this.nameForm.get('bio')?.value,
        this.userRole
      )
    }, 500);
    for (let post of this.posts) {
      let name = this.activeUser?.displayName
      let newPost = {
        author: this.nameForm.get('name')?.value,
        imgUrl: this.nameForm.get('photo')?.value,
        category: post.category,
        description: post.description,
        createdOn: post.createdOn,
        likes: post.likes,
        comments: post.comments,
        isEdited: post.isEdited,
        id: post.id
      }
      if (post.author === name) {
        this.itemService.editPost(newPost).subscribe()
        this.fetchPost()
      }
    }
    this.toggleForm = !this.toggleForm;
  }

  fetchData() {
    this.afs.collection('users').doc<User>(localStorage.getItem('id')).get().subscribe((res: any) => {
      this.nameForm.get('name')?.setValue(res.data()?.displayName),
        this.nameForm.get('photo')?.setValue(res.data()?.photoURL),
        this.nameForm.get('bio')?.setValue(res.data()?.bio)
    })
  }

  fetchPost(){
    this.itemService.getAllPosts()
    .subscribe(data => this.posts = data)
  }

  asyncValidator() {
    return new Promise(resolve => {
      this.check_displayName().then(snapshot => {
        if (snapshot.docs.length > 0 && this.activeUser?.displayName !== this.nameForm.get('name')?.value) {
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
    return firstValueFrom(
      this.afs.collection('users', ref => 
      ref.where(
        'displayName', '==', this.nameForm.get('name').value
        ))
      .get());
  }

  onDeletePost(post: Post, e: Event) {
    this.itemService.deletePost(post).subscribe(
      () => {
        this.fetchPost();
      }
    );
    e.stopPropagation();
  }

  onEditPost(post: Post, e: Event) {
    const dialogRef = this.dialog.open(MatInputPromptComponent, {
      width: '700px',
      height: '450px',
    });

    this.itemService.itemToEdit.next(post)
    dialogRef.afterClosed().pipe(delay(1000)).subscribe((data) => {
      this.dataFromDialog = data.form;
      post.isEdited = true;
    });

    e.stopPropagation();
  }

  likePost(post: Post, e: Event) {
    let exists = false;
    if (post.likes) {
      for (let like of post.likes) {
        if (like?.displayName === this.activeUser?.displayName) {
          this.itemService.likePost(post.id, post.likes).subscribe();
          exists = true;
          post.toggleButtonLike = true;
          let index = post.likes.map(p => p.displayName).indexOf(this.activeUser?.displayName);  
            if (index !== -1) {
              post.likes?.splice(index, 1);
              this.itemService.likePost(post.id, post.likes).subscribe();
            }
        }
      }
        if (!exists) {
          post.likes.push({ 'displayName': this.activeUser?.displayName })
          this.itemService.likePost(post.id, post.likes).subscribe();
          post.toggleButtonLike = false;
        }
    } else {
      if(this.activeUser) {
          post.likes = [{ 'displayName': this.activeUser?.displayName }];
          this.itemService.likePost(post.id, [{ 'displayName': this.activeUser?.displayName }]).subscribe();
          post.toggleButtonLike = false;
    } 
  }
    e.stopPropagation();
  }

}
