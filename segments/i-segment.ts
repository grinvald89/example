interface IFilter {
	entityTypeId : number;
	filterOperator : string;
	order? : number;
	segment? : number;
	type : string;
	value : string;

	/* Свойства в FE */
	name? : string;
	selected? : boolean;
	_logicalOperator? : string;
	filterOperator_name? : string;
}

export interface ISegment {
	company : number;
	endMonthNum : number;
	endYearNum : number;
	filter : IFilter[];
	group : string;
	id : number;
	lastState : boolean;
	name : string;
	startMonthNum : number;
	startYearNum : number;

	/* Свойства в FE */
	unsaved? : boolean;
	filterFromServer? : IFilter[];
}