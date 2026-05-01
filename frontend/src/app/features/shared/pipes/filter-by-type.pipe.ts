
import { Pipe, PipeTransform } from '@angular/core';
import { DashboardColumnData } from '../../../core/services/dashboard.service';

@Pipe({
  name: 'filterByType',
  standalone: true,
})
export class FilterByTypePipe implements PipeTransform {
  transform(items: DashboardColumnData[] | null, type: 'trello' | 'github'): DashboardColumnData[] {
    if (!items || !type) {
      return [];
    }
    return items.filter((item) => item.type === type);
  }
}
