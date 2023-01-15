import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ItemService, Post } from '../item.service';
import { MatInputPromptComponent } from '../mat-input-prompt/mat-input-prompt.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of, Subject } from 'rxjs';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css'],
  animations: [
    trigger("inOutAnimation", [
      state("in", style({ opacity: 1 })),
      transition(":enter", [
        animate(
          300,
          keyframes([
            style({ opacity: 0, offset: 0 }),
            style({ opacity: 0.25, offset: 0.25 }),
            style({ opacity: 0.5, offset: 0.5 }),
            style({ opacity: 0.75, offset: 0.75 }),
            style({ opacity: 1, offset: 1 }),
          ])
        )
      ]),
      transition(":leave", [
        animate(
          300,
          keyframes([
            style({ opacity: 1, offset: 0 }),
            style({ opacity: 0.75, offset: 0.25 }),
            style({ opacity: 0.5, offset: 0.5 }),
            style({ opacity: 0.25, offset: 0.75 }),
            style({ opacity: 0, offset: 1 }),
          ])
        )
      ])
    ]),
    trigger("slideAnimation", [
      state("in", style({ opacity: 1 })),
      state("out", style({ opacity: 1 })),
      transition("in => out", [
        animate(
          300,
          keyframes([
            style({ opacity: 0, offset: 0 }),
            style({ opacity: 0.25, offset: 0.25 }),
            style({ opacity: 0.5, offset: 0.5 }),
            style({ opacity: 0.75, offset: 0.75 }),
            style({ opacity: 1, offset: 1 }),
          ])
        )
      ]),
      transition(":leave", [
        animate(
          300,
          keyframes([
            style({ opacity: 1, offset: 0 }),
            style({ opacity: 0.75, offset: 0.25 }),
            style({ opacity: 0.5, offset: 0.5 }),
            style({ opacity: 0.25, offset: 0.75 }),
            style({ opacity: 0, offset: 1 }),
          ])
        )
      ])
    ])
  ]
})
export class BlogPostComponent implements OnInit, OnDestroy {

  max: number = 8;

  textSearch: FormControl = new FormControl('');
  private untilDestroy = new Subject();
  categories: FormControl = new FormControl('Description');
  posts: Post[] = [];

  dataFromDialog: any;
  activeUser: any | undefined;

  constructor(
    private itemService: ItemService,
    private dialog: MatDialog,
    private afs: AngularFirestore) { }


  ngOnDestroy(): void {
    this.untilDestroy.next(null);
    this.untilDestroy.complete();
  }

  ngOnInit(): void {

    this.itemService.getAllPosts()
      .subscribe((data) => {
        this.posts = data;
        for (let post of this.posts) {
          post.toggleButtonLike = true;
          setTimeout(() => {
            if (post.likes) {
              for (let like of post.likes) {
                if (like.displayName === this.activeUser?.displayName) {
                  post.toggleButtonLike = false;
                }
              }
            } else {
              post.toggleButtonLike = true;
            }
          }, 1000);
        }
      })

      this.itemService.post$.subscribe((post: Post) => {
        for (let pos of this.posts) {
        if (pos.id === post.id) {
          let index = this.posts.findIndex(p => p.id === pos.id)
          this.posts[index] = post;
        }
      }
      this.itemService.getAllPosts().subscribe(p => {this.posts = p})
    })
    

    this.afs.collection('users')
      .doc(localStorage.getItem('id')!)
      .valueChanges()
      .subscribe(res => {
        this.activeUser = res;
      })

  }

  loadMore() {
    this.max = this.max + 8;
  }

  filteredByDescription: Observable<Post[]> = this.textSearch?.valueChanges.pipe(
    takeUntil(this.untilDestroy.asObservable()),
    startWith(''),
    debounceTime(1500),
    tap(),
    switchMap(searchValue => {
  
      if (this.categories.value! === 'Description') {
        return of(this.posts)
          .pipe(
            map(post => {
              return post.filter(
                post => post.description?.toLowerCase().includes(searchValue))
            }))
      }
      else if (this.categories.value! === 'Author') {
        return of(this.posts)
          .pipe(
            map(post => {
              return post.filter(
                post => post.author?.toLowerCase().includes(searchValue))
            }))
      }
      else if (this.categories.value! === 'Categories') {
        return of(this.posts)
          .pipe(
            map(post => {
              return post.filter(
                 post => post.category?.toLowerCase().includes(searchValue)
                   )
            }))
      } else
        return of(this.posts)
          .pipe(
            map(post => {
              return post.filter(
                post => post.description?.toLowerCase().includes(searchValue))
            }))
    }))

  onDeletePost(post: Post, e: Event) {
    this.itemService.deletePost(post).subscribe();
    e.stopPropagation();
  }

  onEditPost(post: Post, e: Event) {

    const dialogRef = this.dialog.open(MatInputPromptComponent, {
      width: '700px',
      height: '450px',
    });

    this.itemService.itemToEdit.next(post);
    dialogRef.afterClosed().subscribe((data) => {
      this.dataFromDialog = data.form;
      post.isEdited = true;
      
    });

    e.stopPropagation();
  }

  likePost(post: Post, e: Event) {
    let exists = false;
    if (post.likes) {
      for (let like of post.likes) {
        if (like.displayName === this.activeUser?.displayName) {
          this.itemService.likePost(post.id, post.likes).subscribe();
          exists = true;
          post.toggleButtonLike = true;
          let index = post.likes.map(p => p.displayName).indexOf(this.activeUser.displayName);  
            if (index !== -1) {
              post.likes?.splice(index, 1);
              this.itemService.likePost(post.id, post.likes).subscribe();
            }
        }
      }
        if (!exists) {
          post.likes.push({ displayName: this.activeUser.displayName })
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

