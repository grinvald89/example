import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'byType',
	pure: false
})

export class ByTypePipe implements PipeTransform {
	transform(items: any[], filter: any): any {
		if (!items || !filter)
			return items;

		return items.filter(item => item.type == filter);
	}
}
