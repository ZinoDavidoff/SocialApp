import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { ItemService, Post } from '../item.service';
import { MatInputPromptComponent } from '../mat-input-prompt/mat-input-prompt.component';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthService } from '../auth.service';
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
export class BlogPostComponent implements OnInit {

  max: number = 8;

  textSearch: FormControl = new FormControl('');
  categories: FormControl = new FormControl('Description');
  posts: Post[] = [];

  dataFromDialog: any;
  activeUser: any;

  constructor(private itemService: ItemService, private dialog: MatDialog, private auth: AuthService, private afs: AngularFirestore,) { }

  ngOnInit(): void {

    this.itemService.getAllPosts()
      .subscribe((data) => {
        this.posts = data;
      })

    this.afs.collection('users')
      .doc(localStorage.getItem('id')!)
      .valueChanges()
      .subscribe(res => { this.activeUser = res })

}

loadMore() {
  this.max = this.max + 8;
}

filteredByDescription: Observable<Post[]> = this.textSearch?.valueChanges.pipe(
  startWith(''),
  debounceTime(800),
  switchMap(searchValue => {

    if (this.categories.value! === 'Description') {
      return of(this.posts)
        .pipe(
          map(post => {
            return post.filter(
              post => post.description.toLowerCase().includes(searchValue))
          }))
    }
    else if (this.categories.value! === 'Author') {
      return of(this.posts)
        .pipe(
          map(post => {
            return post.filter(
              post => post.author.toLowerCase().includes(searchValue))
          }))
    }
    else if (this.categories.value! === 'Categories') {
      return of(this.posts)
        .pipe(
          map(post => {
            return post.filter(
              post => post.category.toLowerCase().includes(searchValue))
          }))
    } else
      return of(this.posts)
        .pipe(
          map(post => {
            return post.filter(
              post => post.description.toLowerCase().includes(searchValue))
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

  this.itemService.itemToEdit.next(post)

  dialogRef.afterClosed().subscribe((data) => {
    this.dataFromDialog = data.form;
    post.isEdited = true;
  });

  e.stopPropagation();
}
}
