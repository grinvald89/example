import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SegmentGroupComponent } from './segment-group/segment-group.component';

import { ConvertService } from '../../../convert.service';

import { ISegment } from './../i-segment';

@Component({
	selector: 'app-active-segment',
	templateUrl: './active-segment.component.html',
	styleUrls: ['./active-segment.component.scss']
})

export class ActiveSegmentComponent {

	/*
	 * Segments - все, доступные пользователю, сегменты
	 * ActiveSegment - выбранный сегмент
	*/

	@Input() Segments: ISegment[];

	@Input() ActiveSegment: ISegment;
	@Output() ActiveSegmentChange = new EventEmitter();

	_activeSegment: ISegment;

	get activeSegment() {
		return this._activeSegment;
	}

	set activeSegment(value) {
		this._activeSegment = this.convertService.copyObject(value);
		this.ActiveSegmentChange.emit(value);
	}

	// onSegmentsVisible(segment: any): void {
	// 	if (!segment.visible) {
	// 		segment.visible = true;

	// 		for (let _segment of this.Segments)
	// 			// Привязать к id
	// 			if (_segment.name != segment.name)
	// 				_segment.visible = false;
	// 	}
	// }

	constructor(private convertService: ConvertService) {}

	filterGroup(name: string): Array<any> | 0 {
		return Array.isArray(this.Segments) ? this.Segments.filter(item => item.group == name) : 0;
	}

	ngOnChanges(changes) {
		if (changes.ActiveSegment)
			this._activeSegment = changes.ActiveSegment.currentValue;
	}
}