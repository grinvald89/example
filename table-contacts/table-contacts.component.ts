import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../../data.service';

@Component({
	selector: 'app-table-contacts',
	templateUrl: './table-contacts.component.html',
	styleUrls: ['./table-contacts.component.scss']
})

export class TableContactsComponent implements OnInit {
	@Input() section;
	@Input() short;
	@Input() table;
	@Input() header;
	@Input() contacts;
	@Input() activeSegment;

	@Input() groupChat; // Убрать после вывода диалогов в отдельный компонент

	@Output() showChat = new EventEmitter();
	@Output() showGroupChat = new EventEmitter(); // Убрать после вывода диалогов в отдельный компонент

	@ViewChild('thead') thead;
	@ViewChild('theadParent') theadParent;
	@ViewChild('tbody') tbody;
	@ViewChild('controls') controls;
	@ViewChild('tableContent') tableContent;
	@ViewChild('tableOverlayLeft') tableOverlayLeft;
	@ViewChild('tableOverlayRight') tableOverlayRight;

	showOverlayLeft: boolean = false;
	showOverlayRight: boolean = false;
	selectedAll: boolean = false;

	constructor(private dataService: DataService) { }

	visibleColumn (name: string): boolean {
		if (this.short)
			return this.table.columns.important[name];
		else
			return this.table.columns.visibles[name];
	}

	fixHeader() {
		if (!this.contacts.length)
			return 0;

		if (this.section == 'dialogues') { // Убрать после вывода диалогов в отдельный компонент
			this.tbody.nativeElement.style.minWidth = 'auto';
			return 0;
		}

		let setHeadWidth = () => {
			let headColumns = this.thead.nativeElement.querySelectorAll('li'),
				bodyColumns = this.tbody.nativeElement.querySelectorAll('tbody tr:first-child td');

			for (let i = 0; i < bodyColumns.length; ++i) {
				let paddingLeft = parseInt(getComputedStyle(bodyColumns[i]).paddingLeft),
					paddingRight = parseInt(getComputedStyle(bodyColumns[i]).paddingRight);

				headColumns[i].style.width = (bodyColumns[i].clientWidth - paddingLeft - paddingRight).toString() + 'px';
			}

			this.tbody.nativeElement.style.minWidth = (this.tableContent.nativeElement.offsetWidth - parseInt(getComputedStyle(this.tableContent.nativeElement).paddingRight)) + 'px';
			this.thead.nativeElement.style.minWidth = (this.tbody.nativeElement.offsetWidth - parseInt(getComputedStyle(this.tbody.nativeElement).paddingRight)) + 'px';
		}

		setTimeout(() => setHeadWidth());
	}

	onSelect(index: number) {
		this.groupChat = false; // Убрать после вывода диалогов в отдельный компонент

		for(let item of this.contacts)
			item.selected = false;

		this.contacts[index].selected = true;

		this.showChat.emit();
	}

	onSelectGroup(index: number | undefined) { // Убрать после вывода диалогов в отдельный компонент
		this.groupChat = true;

		for(let item of this.contacts)
			item.selected = false;

		this.showGroupChat.emit();
	}

	onCheck(index: number) {
		window.event.stopPropagation();

		this.contacts[index].checked = !this.contacts[index].checked;

		this.selectedAll = this.contacts.filter(item => item.checked).length == this.contacts.length;
	}

	selectAll(): void {
		this.selectedAll = !this.selectedAll;

		for(let item of this.contacts)
			item.checked = this.selectedAll;
	}

	getShowOverlayLeft(): boolean {
		return this.tableContent.nativeElement.scrollLeft > 0;
	}

	getShowOverlayRight(): boolean {
		const el = this.tableContent.nativeElement;
		return (el.scrollWidth > el.offsetWidth && el.scrollWidth - el.scrollLeft != el.offsetWidth);		
	}

	onLoadMore(reload: boolean) {
		this.table.loaded = false;
		this.table.loading = true;
		this.table.errorLoading.status = false;

		if (reload) {
			this.contacts = [];
			this.table.offset = 0;
		}

		this.dataService.getContacts(this.table.offset += !reload ? this.dataService.limit : 0, this.activeSegment)
			.subscribe(res => {
					if (res.length < this.dataService.limit)
						this.table.loaded = true;

					for (let item of res)
						this.contacts.push(item);

					this.fixHeader();
					this.table.loading = false;
				},
				err => {
					this.table.loading = false;

					this.table.errorLoading = {
						status: true,
						code: err.status
					};
				}
			);
	}

	ngOnInit() {
		let self = this;

		let setMarginControls = (reset?: boolean): void => {
				if (reset)
					this.controls.nativeElement.style.marginLeft = "0px";

				this.controls.nativeElement.style.marginLeft = this.tableContent.nativeElement.scrollLeft + "px";				
			};

		this.showOverlayRight = this.getShowOverlayRight();

		window.addEventListener('resize', () => {
			self.fixHeader();
			self.showOverlayRight = self.getShowOverlayRight();
			setMarginControls(true);
		});

		this.tableContent.nativeElement.onscroll = event => {
			self.showOverlayLeft = self.getShowOverlayLeft();
			self.showOverlayRight = self.getShowOverlayRight();
			setMarginControls();

			setTimeout(() => {
				if (self.section != 'dialogues') // Убрать после вывода диалогов в отдельный компонент
					self.theadParent.nativeElement.scrollLeft = self.tableContent.nativeElement.scrollLeft;
			});
		}
	}

	ngOnChanges(changes) {
		let self = this;

		this.tableContent.nativeElement.scrollLeft = 0;
		this.tableContent.nativeElement.scrollTop = 0;
		this.fixHeader();

		if (changes.activeSegment && !changes.activeSegment.firstChange)
			this.onLoadMore(true);

		setTimeout(() => self.showOverlayRight = self.getShowOverlayRight());
	}
}