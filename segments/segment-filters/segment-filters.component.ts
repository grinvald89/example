import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { DataService } from '../../../data.service';
import { ConvertService } from '../../../convert.service';

import { ISegment } from '../i-segment';

import { Properties } from '../properties';

const css = {
	default: {
		position : "static",
		top : "auto",
		marginTop : "-9px",
		marginBottom : "0",
		paddingBottom : "10px"		
	},

	shift: {
		position : "absolute",
		paddingBottom : "0px"
	}
}

@Component({
	selector: 'app-segment-filters',
	templateUrl: './segment-filters.component.html',
	styleUrls: ['./segment-filters.component.scss']
})

export class SegmentFiltersComponent {
	@Input() ActiveSegment: ISegment;
	@Output() ActiveSegmentChange = new EventEmitter();

	@Output() invokeUpdateSegment = new EventEmitter();
	@Output() invokeDeleteSegment = new EventEmitter();

	@ViewChild('filtersEl') filtersEl;

	visible: any = {};

	loading = false;

	statusPopup = "none";

	isNewSegment: boolean = false;

	activeFilterId: number;

	clickTime = new Date().getTime();

	data = Properties;

	constructor(private dataService: DataService, private convertService: ConvertService) { }

	getTypeName(type: string) {
		return this.data.property.filter(item => item.value == type)[0].name;
	}

	updateSelectedFilters(segment) {
		let _segment = this.convertService.copyObject(segment);
		_segment.unsaved = true;
		_segment.filterFromServer = this.convertService.filterFromServer(segment);
		this.ActiveSegmentChange.emit(_segment);
	}

	onDeleteFilter(index: number, event) {
		event.stopPropagation();
		this.ActiveSegment.filter.splice(index, 1);
		this.updateSelectedFilters(this.convertService.copyObject(this.ActiveSegment));
	}

	onSaveSegment() {
		// Добавить проверку, чтобы не было сегментов с одинаковыми именами в группе, если ее не будет на BE

		this.ActiveSegment.endMonthNum = 0;
		this.ActiveSegment.endYearNum = 0;
		this.ActiveSegment.startMonthNum = 0;
		this.ActiveSegment.startYearNum = 0;
		this.ActiveSegment.lastState = true;
		this.ActiveSegment.group = this.data.group['value'];

		let _segment = { };

		for (let key in this.ActiveSegment)
			_segment[key] = this.ActiveSegment[key];

		_segment['filter'] = _segment['filterFromServer'];

		this.loading = true;

		if (this.isNewSegment)
			this.dataService.addSegment(_segment)
				.subscribe(
					res => {
						this.ActiveSegment.unsaved = false;
						this.invokeUpdateSegment.emit(JSON.parse(res['_body']));
						this.statusPopup = "success";
						this.loading = false;
					},
					err => {
						this.statusPopup = "error";
						this.loading = false;
					});

		else
			this.dataService.changeSegment(_segment)
				.subscribe(
					res => {
						this.ActiveSegment.unsaved = false;
						this.invokeUpdateSegment.emit(JSON.parse(res['_body']));
						this.statusPopup = "success";
						this.loading = false;
					},
					err => {
						this.statusPopup = "error";
						this.loading = false;
					});
	}

	onDeleteSegment(event) {
		this.dataService.deleteSegment(this.ActiveSegment.id)
			.subscribe(res => {
				this.invokeDeleteSegment.emit();
				this.ActiveSegment.id = -1;
				this.ActiveSegmentChange.emit(this.ActiveSegment);
			});
	}

	onSelect(id: number) {
		let index = -1;

		this.data.group.data.forEach((item, i) => {
			item['selected'] = false;

			if (item.id == id)
				index = i;
		});

		if (index == -1)
			return 0;

		this.data.group.data[index]['selected'] = true;

		this.data.group['buffer'] = this.data.group['value'] = this.data.group.data[index].name;
	}

	onFocusOut() {
		let self = this;

		setTimeout(() => {
			self.data.group['visible'] = false;

			for (let item of self.data.group.data)
				if (item.name == self.data.group['buffer'])
					return 0;

			self.data.group['buffer'] = self.data.group['value'];
		}, 100);
	}

	onSetLogicalOperator(event, filter, and) {
		event.stopPropagation();
		filter._logicalOperator = and ? "AND" : "OR";
	}

	// Drag&Drop

	offsetYInElement = -1; // Y сдвиг курсора внутри перетаскиваемого элемента

	resetDragAndDrop(): void {
		this.ActiveSegment.filter.forEach((item, index) => {
			item.selected = false;

			this.resetCssElement(this.filtersEl.nativeElement.querySelectorAll('li')[index]);
		});
	}

	resetCssElement(element) {
		element.classList.remove('shift');

		element.style.position = css.default.position;
		element.style.marginTop = css.default.marginTop;
		element.style.marginBottom = css.default.marginBottom;
		element.style.paddingBottom = css.default.paddingBottom;
		element.style.top = css.default.top;
	}

	onMouseMove(event) {
		let index = -1;

		this.ActiveSegment.filter.forEach((item, i) => {
			if (item.selected)
				index = i;
		});

		if (index !== -1) {
			let _listEl = this.filtersEl.nativeElement.querySelectorAll('li'),
				_firstIndex = index > 0 ? 0 : 1,
				_lastIndex = (index == _listEl.length - 1) ? _listEl.length - 2 : _listEl.length - 1,
				element = _listEl[index],
				shiftEl = this.filtersEl.nativeElement.querySelector('li.shift'),
				elementPos = element.getBoundingClientRect();

			event._clientY = event.clientY + (event.clientY * (1 - parseFloat(document.body.style.zoom)));

			if (_listEl.length == 1)
				return 0;

			if (event._clientY < _listEl[_firstIndex].getBoundingClientRect().top - elementPos.height)
				return 0;

			if (event._clientY > _listEl[_lastIndex].getBoundingClientRect().top + elementPos.height)
				return 0;

			if (this.offsetYInElement == -1)
				this.offsetYInElement = event._clientY - elementPos.top - 9;

			element.style.position = css.shift.position;
			element.style.paddingBottom = css.shift.paddingBottom;
			element.style.top = (event._clientY - this.offsetYInElement) + "px";

			let getPositionShiftEl = () => {
				let isLast = true;

				_listEl.forEach((item, i) => {
					item.classList.remove('shift');
					item.style.marginTop = css.default.marginTop;

					let itemPos = item.getBoundingClientRect();

					if (elementPos.top > itemPos.top && elementPos.top < itemPos.top + itemPos.height && i !== index) {
						item.classList.add('shift');
						item.setAttribute('style' , 'margin-top: ' + elementPos.height + 'px !important');
						isLast = false;
					}
				});

				_listEl[_listEl.length - 1].style.marginBottom = isLast ? elementPos.height + "px" : "0";
			};

			if (shiftEl) {
				let shiftPos = shiftEl.getBoundingClientRect();

				if ((elementPos.top + elementPos.height) > shiftPos.top && (elementPos.top + elementPos.height) < (shiftPos.top + shiftPos.height))
					return 0;
				else
					getPositionShiftEl();
			}
			else
				getPositionShiftEl();
		}
	}

	onMousedown(filter) {
		filter.selected = true;
		this.clickTime = new Date().getTime();
	}

	onMouseUp() {
		this.offsetYInElement = -1;

		let selectedIndex = -1,
			shiftIndex = -1,
			shiftElCount = this.filtersEl.nativeElement.querySelectorAll('li.shift').length;

		const allowableTimeDelay = 500;

		this.ActiveSegment.filter.forEach((li, k) => {
			if (li.selected) {
				selectedIndex = k;

				if (selectedIndex > 0 && this.ActiveSegment.filter.length > selectedIndex + 1 && this.ActiveSegment.filter[selectedIndex]._logicalOperator != "AND")
					this.ActiveSegment.filter[selectedIndex - 1]._logicalOperator = "OR";

				li._logicalOperator = "OR";
			}
		});

		this.filtersEl.nativeElement.querySelectorAll('li').forEach((item, i) => {
			if (item.classList.contains('shift'))
				shiftIndex = i;

			this.resetCssElement(item);
		});

		if (Math.abs(this.clickTime - new Date().getTime()) < allowableTimeDelay) {
			this.resetDragAndDrop();

			if (selectedIndex != -1)
				this.activeFilterId = selectedIndex;

			return 0;
		}

		if (shiftIndex == -1) {
			this.ActiveSegment.filter.push(this.ActiveSegment.filter[selectedIndex]);
			this.ActiveSegment.filter.splice(selectedIndex, 1);
		}
		else if (shiftIndex > selectedIndex) {
			this.ActiveSegment.filter.splice(shiftIndex, 0, this.ActiveSegment.filter[selectedIndex]);
			this.ActiveSegment.filter.splice(selectedIndex, 1);
			shiftIndex--;
		}
		else if (shiftIndex < selectedIndex) {
			this.ActiveSegment.filter.splice(shiftIndex, 0, this.ActiveSegment.filter[selectedIndex]);
			this.ActiveSegment.filter.splice(selectedIndex + 1, 1);
		}

		if (shiftIndex > 0 && this.ActiveSegment.filter[shiftIndex - 1]._logicalOperator == "AND")
			this.ActiveSegment.filter[shiftIndex]._logicalOperator = "AND";

		this.resetDragAndDrop();

		this.updateSelectedFilters(this.ActiveSegment);
	}

	// Drag&Drop

	ngOnChanges(changes) {
		if (changes.ActiveSegment.currentValue) {
			let index = -1;

			this.data.group.data.map((item, i) => {
				if (item.value === changes.ActiveSegment.currentValue.group)
					index = i;
			});

			if (index != -1) {
				this.data.group['value'] = this.data.group.data[index].value;
				this.data.group['buffer'] = this.data.group.data[index].name;
			}
			else {
				this.data.group['value'] = this.data.group.data[0].value;
				this.data.group['buffer'] = this.data.group.data[0].name;
			}
		}

		this.isNewSegment = !(changes.ActiveSegment && changes.ActiveSegment.currentValue.id !== -1);
	}
}