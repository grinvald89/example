import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { ConvertService } from '../../../../convert.service';

import { ISegment } from '../../i-segment';

@Component({
	selector: 'app-segment-group',
	templateUrl: './segment-group.component.html',
	styleUrls: ['./segment-group.component.scss']
})

export class SegmentGroupComponent {

	/*
	 * All - Возможность выбрать все сегменты ("Все")
	 * Visible - открыт/закрыт список сегментов
	 * Name - имя группы
	 * Segments - сегменты данной группы
	 * ActiveSegment - выбранный сегмент
	*/

	@Input() All: boolean;
	@Input() Visible: boolean;
	@Input() Name: string;
	@Input() Segments: ISegment[];

	@Input() ActiveSegment: ISegment;
	@Output() ActiveSegmentChange = new EventEmitter();

	@ViewChild('segmentsWrap') segmentsWrap;
	@ViewChild('segmentsContent') segmentsContent;

	allSegmentSelected: boolean = true;
	isSegmentsVisible: boolean = false;

	constructor(private convertService: ConvertService) {}

	onSelectSegment(id: number) {
		if (this.ActiveSegment.id !== id) {
			let _activeSegment = this.convertService.copyObject(this.ActiveSegment);
			_activeSegment.id = id;
			_activeSegment.unsaved = false;

			if (id == -1)
				_activeSegment.filter = [];

			this.ActiveSegmentChange.emit(_activeSegment);
		}
	}

	onSegmentsVisible(container, content, time: number, show: boolean) {
		const	timeInterval = 10,
				heightSegment = content.nativeElement.clientHeight / (time / timeInterval);

		let _heigth = (show) ? 0 : content.nativeElement.clientHeight,
			_time = 0;				

		let animate = setInterval(() => {
			if (_time >= time) {
				clearInterval(animate);
				this.segmentsWrap.nativeElement.style.height = (show ? content.nativeElement.clientHeight : 0)  + 'px';
			}
			else {
				_time += timeInterval;
				_heigth = _heigth + heightSegment * (show ? 1 : -1);
				this.segmentsWrap.nativeElement.style.height = _heigth + 'px';
			}
		}, timeInterval);
	}
}