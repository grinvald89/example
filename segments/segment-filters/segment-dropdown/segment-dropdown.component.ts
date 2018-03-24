import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-segment-dropdown',
    templateUrl: './segment-dropdown.component.html',
    styleUrls: ['./segment-dropdown.component.scss']
})

export class SegmentDropdownComponent implements OnInit {
    @Input() IsField? : boolean;
    @Input() Property: string;
	  @Input() Placeholder: string;
	  @Input() Index: number;
    @Input() Filter;
	  @Input() List: any[];
    @Input() AllList: any[];

    @Output() SaveType = new EventEmitter();
    @Output() ClearFields = new EventEmitter();
    @Output() InvokeRemoveFilter = new EventEmitter();

    constructor() { }

    onBlur(type: string): void | 0 {
      let self = this;

      setTimeout(() => {
        self.Filter.visible[type] = false;

        if (!self.IsField) {
          for(let item of self.List)
            if (item.name == self.Filter.buffer[type])
              self.Filter.values[type] = self.Filter.buffer[type];

          self.Filter.buffer[type] = self.Filter.values[type];

          self.SaveType.emit(type);
        }
      }, 100);
    }

    onSelect(type: string, id: number): void | 0 {
      if (!this.IsField) {
        let index = -1;

        this.ClearFields.emit(type);

        this.AllList.forEach((item, i) => {
          item.selected = false;

          if (item.id == id)
            index = i;
        });

        if (index == -1)
          return 0;

        this.AllList[index].selected = true; // пока не работает, возможно не понадобится

        this.Filter.buffer[type] = this.Filter.values[type] = this.AllList[index].name;

        this.SaveType.emit(type);

        if (type == 'parameter')
          this.Filter.values.entityTypeId = this.AllList[index].id;

        if (type == 'filterOperator_name')
          this.Filter.values.filterOperator = this.AllList[index].value;

        this.Filter.visible[type] = false; // проверить, возможно убрать, должно срабатывать в blur
      }
    }

    ngOnInit() { }
}