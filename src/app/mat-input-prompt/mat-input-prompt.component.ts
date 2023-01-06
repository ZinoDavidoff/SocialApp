import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../auth.service';
import { ItemService, Post } from '../item.service';

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

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data: { message: string },
    public dialogRef: MatDialogRef<MatInputPromptComponent>,
    private itemService: ItemService,
    private afs: AngularFirestore
  ) {
    this.form = this.fb.group({
      author: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    this.itemService.itemToEdit.subscribe(res => {
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

    this.afs.collection('users').doc(localStorage.getItem('id')!).valueChanges().subscribe(res =>  this.activeUser = res)

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

  editPost() {
    let post: Post  = {
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
    this.itemService.editPost(post).subscribe()
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
      id: this.itemId,
    }
    this.itemService.createNewPost(post).subscribe()
  }
}
