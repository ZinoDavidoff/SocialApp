import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sorted'
})
export class SortedPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    value = [...value];

    return value.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());

  }

}
