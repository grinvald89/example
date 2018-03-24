import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { DataService } from '../../../../data.service';
import { ConvertService } from '../../../../convert.service';

import { ISegment } from '../../i-segment';

import { Properties } from '../../properties';

@Component({
	selector: 'app-create-segment',
	templateUrl: './create-segment.component.html',
	styleUrls: ['./create-segment.component.scss']
})

export class CreateSegmentComponent implements OnInit {
	@Input() ActiveSegment: ISegment;
	@Output() ActiveSegmentChange = new EventEmitter();

	@Input() ActiveFilterId;
	@Output() ActiveFilterIdChange = new EventEmitter();

	data = Properties;

	filters = [];

	loadProperties = {
		properties: [false, false],
		loaded: false
	};

	constructor(private dataService: DataService, private convertService: ConvertService) { }

	addFilter() {
		if (this.filters.filter(item => item.values.value === "").length)
			return 0;

		this.filters.push({
				visible: {
					property: false,
					name: false,
					filterOperator_name: false,
					value: false
				},

				buffer: {
					property: '',
					name: '',
					filterOperator_name: '',
					value: '',
					group: ''
				},

				values: {
					property: '',
					name: '',
					filterOperator_name: '',
					value: '',
					group: ''
				}
			});
	}

	removeFilter(index: number): void {
		this.filters.splice(index, 1);
	}

	onCancel(): void {
		this.filters = [];
		this.addFilter();
		this.ActiveFilterIdChange.emit();
	}

	isActiveApplyButton(): boolean {
		let result: boolean = true;

		this.filters.forEach(item => {
			if (!item.values.type)
				result = false;

			if (item.values.type == "Property type" && item.values.value == "")
				result = false;

			if (item.values.type == "Event type" && item.values.filterOperator == "")
				result = false;
		});

		return result;
	}

	onApplyFilter(): void | 0 {
		if (!this.isActiveApplyButton())
			return 0;

		if (this.ActiveFilterId !== undefined)
			this.ActiveSegment.filter[this.ActiveFilterId] = {
				entityTypeId: this.data.name.filter(name => name.name == this.filters[0].values.name)[0].id,
				filterOperator: this.filters[0].values.filterOperator,
				name: this.filters[0].values.name,
				filterOperator_name: this.filters[0].values.filterOperator_name,
				type: this.filters[0].values.type,
				value: this.filters[0].values.value,
				_logicalOperator: this.filters[0].values._logicalOperator
			}
		else {
			this.filters.forEach((item, index) => {
				this.ActiveSegment.filter.push({
					entityTypeId: this.data.name.filter(name => name.name == item.values.name)[0].id,
					filterOperator: item.values.filterOperator,
					name: item.values.name,
					filterOperator_name: item.values.filterOperator_name,
					type: item.values.type,
					value: item.values.value,
					_logicalOperator: item._logicalOperator
				});
			});
		}

		this.ActiveSegmentChange.emit(this.convertService.copyObject(this.ActiveSegment));
		this.onCancel();
	}

	ngOnInit() {
		this.addFilter();

		let self = this,
			setPropertyLoaded = index => {
				self.loadProperties.properties[index] = true;

				for (let item of self.loadProperties.properties)
					if (!item)
						return 0;

				self.loadProperties.loaded = true;
			};

		this.dataService.getContactPropertyTypes()
			.subscribe(res => {
				for (let item of res) {
					item.type = "Property type";
					this.data.name.push(item);
				}

				setPropertyLoaded(0);
			});

		this.dataService.getContactEventTypes()
			.subscribe(res => {
				for (let item of res) {
					item.type = "Event type";
					this.data.name.push(item);
				}

				setPropertyLoaded(1);
			});
	}

	ngOnChanges(changes) {
		if (changes['ActiveSegment']) {
			this.ActiveFilterId = undefined;
			this.filters = [];
			this.addFilter();
		}

		if (changes['ActiveFilterId'] && changes['ActiveFilterId'].currentValue !== undefined) {
			this.filters = [];

			let entityTypeId = this.ActiveSegment.filter[this.ActiveFilterId].entityTypeId,
				type = this.ActiveSegment.filter[this.ActiveFilterId].type;

			this.filters.push({
				values: {
					property: this.ActiveSegment.filter[this.ActiveFilterId].type,
					type: this.ActiveSegment.filter[this.ActiveFilterId].type,
					name: this.data.name.filter(item => item.id === entityTypeId)[0].name,
					filterOperator: this.ActiveSegment.filter[this.ActiveFilterId].filterOperator,
					filterOperator_name: this.ActiveSegment.filter[this.ActiveFilterId].filterOperator_name,
					value: this.ActiveSegment.filter[this.ActiveFilterId].value,
					_logicalOperator: this.ActiveSegment.filter[this.ActiveFilterId]._logicalOperator
				},

				buffer: {
					property: this.data.property.filter(item => item.value === type)[0].name,
					name: this.data.name.filter(item => item.id === entityTypeId)[0].name,
					filterOperator_name: this.ActiveSegment.filter[this.ActiveFilterId].filterOperator_name,
					value: this.ActiveSegment.filter[this.ActiveFilterId].value
				},

				visible: {
					property: false,
					name: false,
					filterOperator_name: false,
					value: false
				},
			});
		}
	}
}