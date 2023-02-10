
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, delay, firstValueFrom, map, Observable, Subject, Subscription } from 'rxjs';
import { Post, User } from 'src/app/core/models/interfaces';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemService } from 'src/app/core/services/item.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { MatInputPromptComponent } from 'src/app/shared/mat-input-prompt/mat-input-prompt.component';


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
    private afs: AngularFirestore,
    private toast: ToastService
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

  onDeletePost(post: Post) {
    this.itemService.deletePost(post).pipe(delay(500)).subscribe(
      () => {
        this.fetchPosts()
      }
    );
  }

  onPostCreate() {
    const dialogRef = this.dialog.open(MatInputPromptComponent, {
      disableClose: true,
      width: '700px',
      height: '450px',
    });

    dialogRef.afterClosed().pipe(delay(500)).subscribe((data) => {
      this.dataFromDialog = data.form;
      this.toast.success('New Post successfuly added');
    });
  }

  updateProfile() {
    setTimeout(() => {
      this.authService.updateProfile(
        this.nameForm.get('name')?.value,
        this.nameForm.get('photo')?.value,
        this.nameForm.get('bio')?.value
      )
    }, 500);
    this.toast.success('Your Profile has been updated');
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
        this.itemService.getAllPosts()
          .subscribe(
            (data) => {
              for (let post of data) {
                for (let j = 0; j < post.likes?.length; j++) {
                  if (post.likes[j]?.displayName === name) {
                    post.likes[j].displayName = this.nameForm.get('name')?.value

                  }
                }
                for (let i = 0; i < post.comments?.length; i++) {
                  if (post.comments[i]?.displayName === name) {
                    post.comments[i].displayName = this.nameForm.get('name')?.value
                  }
                }
                this.itemService.patchPost(post.id, post).subscribe()
              }
              this.posts = data
            })
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

  fetchPosts() {
    this.itemService.getAllPosts().subscribe(
      (post) => {
        this.posts = post;
      }
    )
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


}
