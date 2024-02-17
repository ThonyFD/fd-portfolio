import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'sortBy',
  standalone: true,
})
export class SortByPipe implements PipeTransform {

  transform<T, K extends keyof T>(input: T[], sortKey: K, asc: boolean): T[] {
    return [...input].sort((a: T, b: T) => {
      const aValue = a[sortKey] || 0;
      const bValue = b[sortKey] || 0 ;

      if (asc) {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });
  }
}
