import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { Post } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  itemToEdit = new BehaviorSubject<Post>(null);
  post$ = new Subject<Post | Partial<Post>>();

  constructor(private http: HttpClient) { }

  createNewPost(post: Post) {
    return this.http.post('https://myangularproject-90105-default-rtdb.firebaseio.com/posts.json', post)
  }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>('https://myangularproject-90105-default-rtdb.firebaseio.com/posts.json')
      .pipe(map((res) => {
        const posts = [];
        for (const key in res) {
          if (res.hasOwnProperty(key)) {
            posts.push({ ...res[key], id: key })
          }
        }
        return posts;
      })
      )
  }

  editPost(value: Post) {
    return this.http.put<Post>('https://myangularproject-90105-default-rtdb.firebaseio.com/posts/' + value.id + '.json', value)
  }

  patchPost(id: string, post: Partial<Post>) {
    return this.http.patch("https://myangularproject-90105-default-rtdb.firebaseio.com/posts/" + id + ".json",
      {
        'category': post.category,
        'description': post.description,
        'createdOn': post.createdOn,
        'isEdited': post.isEdited,
        'likes': post.likes,
        'comments': post.comments
      })
  }

  deletePost(post: Post) {
    return this.http.delete('https://myangularproject-90105-default-rtdb.firebaseio.com/posts/' + post.id + '.json')
  }

  getPostById(id: string): Observable<any> {
    return this.http.get('https://myangularproject-90105-default-rtdb.firebaseio.com/posts/' + id + '.json')
  }

  likePost(id: string, likes: { displayName: string }[]) {
    return this.http.patch("https://myangularproject-90105-default-rtdb.firebaseio.com/posts/" + id + ".json", { 'likes': likes })
  }

  addComment(id: string, comments: { displayName: string, photoUrl: string, desc: string, createdOn: Date }[]) {
    return this.http.patch("https://myangularproject-90105-default-rtdb.firebaseio.com/posts/" + id + ".json", { 'comments': comments })
  }

}
