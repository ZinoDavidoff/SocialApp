import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { delay } from 'rxjs/operators';
import { Post } from 'src/app/core/models/interfaces';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemService } from 'src/app/core/services/item.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { MatInputPromptComponent } from '../mat-input-prompt/mat-input-prompt.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  @Input() post!: Post;
  activeUser: any;
  dataFromDialog: any;
  @Output() onDelete: EventEmitter<Post> = new EventEmitter<Post>()
  constructor(
    private itemService: ItemService,
    private dialog: MatDialog,
    private afs: AngularFirestore,
    public authService: AuthService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {

    this.afs.collection('users')
      .doc(localStorage.getItem('id')!)
      .valueChanges()
      .subscribe(res => {
        this.activeUser = res;
      })
  }

  onDeletePost(post: Post, e: Event) {
    this.onDelete.emit(post);
   
    this.toast.success('Post successfuly deleted');
    e.stopPropagation();
  }

  onEditPost(post: Post, e: Event) {

    const dialogRef = this.dialog.open(MatInputPromptComponent, {
      disableClose: true,
      width: '700px',
      height: '450px',
    });

    this.itemService.itemToEdit.next(post);
    dialogRef.afterClosed().subscribe((data) => {
      this.dataFromDialog = data.form;
      post.isEdited = true;
      this.toast.success('Post successfuly edited');
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
        post.likes.push({ 'displayName': this.activeUser.displayName })
        this.itemService.likePost(post.id, post.likes).subscribe();
        post.toggleButtonLike = false;
      }
    } else {
      if (this.activeUser) {
        post.likes = [{ 'displayName': this.activeUser?.displayName }];
        this.itemService.likePost(post.id, [{ 'displayName': this.activeUser?.displayName }]).subscribe();
        post.toggleButtonLike = false;
      }
    }
    e.stopPropagation();
  }

}
