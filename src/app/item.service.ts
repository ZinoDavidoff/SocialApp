import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

export interface Post {
    id?: string;
    author: string;
    imgUrl: string
    category: string;
    description: string;
    createdOn: Date;
    likes: number;
    comments: string[]; 
    isEdited: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  itemToEdit = new BehaviorSubject<Post>(null);


  constructor(private http: HttpClient) { }

  createNewPost(post: Post) {
    return this.http.post('https://myangularproject-90105-default-rtdb.firebaseio.com/posts.json', post)
  } 

  getAllPosts(){
    return this.http.get('https://myangularproject-90105-default-rtdb.firebaseio.com/posts.json')
  } 

  editPost(value: Post) {
    return this.http.put('https://myangularproject-90105-default-rtdb.firebaseio.com/posts/'+value.id+'.json', value)
  }

  deletePost(post: Post){
    return this.http.delete('https://myangularproject-90105-default-rtdb.firebaseio.com/posts/'+post.id+'.json')
  }


  getPostById(id: string): Observable<any> {
    return this.http.get('https://myangularproject-90105-default-rtdb.firebaseio.com/posts/'+id+'.json')
  }

}
