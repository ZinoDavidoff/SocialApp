import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Post, User } from 'src/app/core/models/interfaces';
import { CategoryService } from 'src/app/core/services/category.service';
import { ItemService } from 'src/app/core/services/item.service';

@Component({
  selector: 'app-mat-input-prompt',
  templateUrl: './mat-input-prompt.component.html',
  styleUrls: ['./mat-input-prompt.component.css'],
})
export class MatInputPromptComponent implements OnInit {

  form: FormGroup;
  itemId?: string;
  hasId = false;
  activeUser: any;
  editable = true;
  posts: Post[] = [];
  categories: string[] = [];

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data: { message: string },
    public dialogRef: MatDialogRef<MatInputPromptComponent>,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private afs: AngularFirestore
  ) {
    this.form = this.fb.group({
      author: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    })

    this.itemService.itemToEdit.subscribe((res: any) => {
      this.form.get('author').setValue(res.author)
      this.form.get('category').setValue(res.category)
      this.form.get('description').setValue(res.description)
      if (res.id) {
        this.hasId = true
      } else {
        this.hasId = false;
      }
      this.itemId = res.id;
    })

    this.afs.collection('users').doc(localStorage.getItem('id')!).valueChanges().subscribe(res => this.activeUser = res)

    this.afs.collection('users').doc<Partial<User>>(localStorage.getItem('id')).get().subscribe(res => {
      this.form.get('author')?.setValue(res.data()?.displayName)
    })

  }

  close() {
    this.itemService.itemToEdit.next(null)
  }

  submit(form: NgForm) {
    this.dialogRef.close({
      clicked: 'submit',
      form: form,
    });
  }

  patchPost() {

    let post: Partial<Post> = {
      category: this.form.get('category').value,
      description: this.form.get('description').value,
      isEdited: true,
      createdOn: new Date(),
      id: this.itemId
    }

    this.itemService.patchPost(this.itemId, post).subscribe(() => {
      this.itemService.post$.next(post)
    })
  }

  createPost() {
    let post: Post = {
      author: this.form.get('author').value,
      imgUrl: this.activeUser.photoURL,
      category: this.form.get('category').value,
      description: this.form.get('description').value,
      createdOn: new Date(),
      likes: [],
      isEdited: false,
      comments: [],
      id: this.itemId
    }
    this.itemService.createNewPost(post).subscribe(() => {
      this.itemService.post$.next(post)
    })
  }


}
