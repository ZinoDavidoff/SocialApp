import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { ItemService, Post } from '../item.service';
import { MatInputPromptComponent } from '../mat-input-prompt/mat-input-prompt.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css']
})
export class BlogPostComponent implements OnInit {

  textSearch: FormControl = new FormControl('');
  categories: FormControl = new FormControl('Description');
  posts: Post[] = [];

  dataFromDialog: any;

  constructor(private itemService: ItemService, private dialog: MatDialog, private auth: AuthService) { }

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

  }

  filteredByDescription: Observable<Post[]> = this.textSearch?.valueChanges.pipe(
    startWith(''),
    debounceTime(400),
    switchMap(searchValue => {
      
      if(this.categories.value! === 'Description'){
      return of(this.posts)
        .pipe(
          map(post => {
            return post.filter(
              post => post.description.toLowerCase().includes(searchValue))
          }))}
          else if(this.categories.value! === 'Author'){
            return of(this.posts)
        .pipe(
          map(post => {
            return post.filter(
              post => post.author.toLowerCase().includes(searchValue))
          }))
          }
          else if(this.categories.value! === 'Categories'){
            return of(this.posts)
        .pipe(
          map(post => {
            return post.filter(
              post => post.category.toLowerCase().includes(searchValue))
          }))
          }else 
          return of(this.posts)
        .pipe(
          map(post => {
            return post.filter(
              post => post.description.toLowerCase().includes(searchValue))}))
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