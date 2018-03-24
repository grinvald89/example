import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { ActiveSegmentComponent } from './active-segment/active-segment.component';
import { SegmentFiltersComponent } from './segment-filters/segment-filters.component';

import { DataService } from '../../data.service';
import { ConvertService } from '../../convert.service';

import { ISegment } from './i-segment';

import { Properties } from './properties';

@Component({
	selector: 'app-segments',
	templateUrl: './segments.component.html',
	styleUrls: ['./segments.component.scss']
})

export class SegmentsComponent implements OnInit {

	/*
	 * ActiveSegment - параметры выбранного сегмента
	 */

	@Input() ActiveSegment: ISegment;
	@Output() ActiveSegmentChange = new EventEmitter();

	segments: ISegment[];

	_activeSegment: ISegment | undefined;

	get activeSegment() {
		return this._activeSegment;
	}

	set activeSegment(value: ISegment) {
		const previousId = this.activeSegment ? this.activeSegment.id : -2;

		this._activeSegment = value;

		if (this.activeSegment !== undefined && value.id != -1 && previousId !== value.id)			
			this.convertFilters();

		this.ActiveSegmentChange.emit(value);
	}

	constructor(private dataService: DataService, private convertService: ConvertService) { }

	convertFilters() {
		let self = this;

		let getPropertyName = (index: number, segment: ISegment) => {
			let getProperty = type => {
				self.dataService['getContact' + type + 'Type'](segment.filter[index].entityTypeId)
					.subscribe(res => {
						segment.filter[index].name = res['name'];

						if (index + 1 < segment.filter.length)
							getPropertyName(index + 1, segment);
					});
			};

			if (segment.filter[index].type == "Property type")
				getProperty("Property");

			if (segment.filter[index].type == "Event type")
				getProperty("Event");
		};

		let _segments = [],
			_filters = [];

		this.activeSegment = this.convertService.copyObject(this.segments.filter(item => item.id === self.activeSegment.id)[0]);

		for (let i = 0; i < this.activeSegment.filter.length; i++) {
			if (this.activeSegment.filter[i].type != 'Logical operator') {
				let _filter = this.activeSegment.filter[i];

				_filter.filterOperator_name = Properties.filterOperator_name
					.filter(item => item.type == this.activeSegment.filter[i].type && item.value == this.activeSegment.filter[i].filterOperator)[0].name;

				if (i + 1 < this.activeSegment.filter.length && this.activeSegment.filter[i + 1].type == 'Logical operator')
					_filter._logicalOperator = this.activeSegment.filter[i + 1].value;

				_filters.push(_filter);
			}
		}

		this.activeSegment.filter = _filters;

		if (this.activeSegment.filter.length)
			getPropertyName(0, this.activeSegment);
	}

	deleteSegment() {
		this.segments.map((item, index) => {
			if (item.id === this.activeSegment.id)
				this.segments.splice(index, 1);
		});
	}

	updateSegment(segment: ISegment) {
		let index = -1;

		this.segments.forEach((item, i) => {
			if (item.id == segment.id)
				index = i;
		});

		if (index != -1)
			this.segments[index] = segment;
		else
			this.segments.push(segment);

		this.ActiveSegmentChange.emit(segment);
		this.activeSegment.id = segment.id;
	}


	ngOnInit() {
		this.dataService.getSegments()
			.subscribe(res => this.segments = res);
	}

	ngOnChanges(changes) {
		if (!this.activeSegment)
			this.activeSegment = changes.ActiveSegment.currentValue;
	}
}