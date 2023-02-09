import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  createNewCategories(categories: string[]): Observable<string[]> {
    return this.http.put<string[]>("https://myangularproject-90105-default-rtdb.firebaseio.com/categories.json", categories)
  } 

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>("https://myangularproject-90105-default-rtdb.firebaseio.com/categories.json")
  } 

  editCategory(categories: string[]): Observable<string[]> {
    return this.http.put<string[]>("https://myangularproject-90105-default-rtdb.firebaseio.com/categories.json", categories)
  }
}
