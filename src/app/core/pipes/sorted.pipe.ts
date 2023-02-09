import { Pipe, PipeTransform } from '@angular/core';
import { Post } from '../models/interfaces';

@Pipe({
  name: 'sorted'
})
export class SortedPipe implements PipeTransform {

  transform(value: Post[]): Post[] {
    value = [...value];
    return value.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());
  }

}
