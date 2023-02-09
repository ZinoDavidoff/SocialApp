import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, delay, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ItemService } from 'src/app/core/services/item.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Post } from 'src/app/core/models/interfaces';


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
  private untilDestroy = new Subject();
  textSearch: FormControl = new FormControl('');
  categories: FormControl = new FormControl('Description');
  posts: Post[] = [];

  dataFromDialog: any;
  activeUser: any | undefined;

  constructor(
    private itemService: ItemService,
    private afs: AngularFirestore,
    public authService: AuthService,
    ) { }
  
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

}

