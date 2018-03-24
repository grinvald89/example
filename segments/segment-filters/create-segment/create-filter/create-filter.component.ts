import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-create-filter',
  	templateUrl: './create-filter.component.html',
	styleUrls: ['./create-filter.component.scss']
})

export class CreateFilterComponent {
	@Input() data;
	@Input() filter;
	@Input() index;
	@Input() isLastFilter;

	@Output() invokeRemoveFilter = new EventEmitter();

	clearFields(type: string) {
		if (type == 'property') {
			this.filter.values.property = '';
			this.filter.values.name = '';
			this.filter.values.filterOperator_name = '';
			this.filter.values.value = '';

			this.filter.buffer.property = '';
			this.filter.buffer.name = '';
			this.filter.buffer.filterOperator_name = '';
			this.filter.buffer.group = '';
		}
	}

	saveType(type: string) {
		if (type == 'property' && this.filter.values.property)
			this.filter.values['type'] = this.data.property.filter(item => item.name == this.filter.values.property)[0].value;
	}
}
