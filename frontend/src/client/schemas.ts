export const $HTTPValidationError = {
	properties: {
		detail: {
	type: 'array',
	contains: {
		type: 'ValidationError',
	},
},
	},
} as const;

export const $InquiryCreate = {
	properties: {
		text: {
	type: 'string',
	isRequired: true,
	maxLength: 256,
	minLength: 10,
},
		theme_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
	isRequired: true,
},
		first_scheduled: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'date-time',
}, {
	type: 'null',
}],
	isRequired: true,
},
	},
} as const;

export const $InquiryDelete = {
	properties: {
		text: {
	type: 'string',
	isRequired: true,
	maxLength: 256,
	minLength: 10,
},
		theme_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
	isRequired: true,
},
		first_scheduled: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'date-time',
}, {
	type: 'null',
}],
	isRequired: true,
},
		id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $InquiryPublic = {
	properties: {
		text: {
	type: 'string',
	isRequired: true,
},
		theme_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
	isRequired: true,
},
		first_scheduled: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'date-time',
}, {
	type: 'null',
}],
	isRequired: true,
},
		id: {
	type: 'number',
	isRequired: true,
},
		created_at: {
	type: 'string',
	isRequired: true,
	format: 'date-time',
},
		theme: {
	type: 'any-of',
	contains: [{
	type: 'ThemePublic',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $InquiryUpdate = {
	properties: {
		text: {
	type: 'string',
	isRequired: true,
	maxLength: 256,
	minLength: 10,
},
		theme_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
	isRequired: true,
},
		first_scheduled: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'date-time',
}, {
	type: 'null',
}],
	isRequired: true,
},
		id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $InquriesPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'InquiryPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $Message = {
	properties: {
		message: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $ScheduleCreate = {
	properties: {
		schedule: {
	type: 'ScheduleInfo',
	isRequired: true,
},
	},
} as const;

export const $ScheduleInfo = {
	properties: {
		startDate: {
	type: 'string',
	isRequired: true,
},
		endDate: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
	isRequired: true,
},
		daysBetween: {
	type: 'number',
	isRequired: true,
},
		skipWeekends: {
	type: 'boolean',
	isRequired: true,
},
		skipHolidays: {
	type: 'boolean',
	isRequired: true,
},
		timesOfDay: {
	type: 'array',
	contains: {
	type: 'string',
},
	isRequired: true,
},
	},
} as const;

export const $SchedulePublic = {
	properties: {
		schedule: {
	type: 'ScheduleInfo',
	isRequired: true,
},
		id: {
	type: 'number',
	isRequired: true,
},
		scheduled_inquiries: {
	type: 'array',
	contains: {
	type: 'number',
},
	isRequired: true,
},
	},
} as const;

export const $ThemeCreate = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
	maxLength: 255,
	minLength: 1,
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
	maxLength: 1024,
}, {
	type: 'null',
}],
},
	},
} as const;

export const $ThemePublic = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
	maxLength: 255,
	minLength: 1,
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
	maxLength: 1024,
}, {
	type: 'null',
}],
},
		id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $ThemesPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'ThemePublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $UserCreate = {
	properties: {
		email: {
	type: 'string',
	isRequired: true,
	format: 'email',
	maxLength: 255,
},
		is_active: {
	type: 'boolean',
	default: true,
},
		is_superuser: {
	type: 'boolean',
	default: false,
},
		full_name: {
	type: 'any-of',
	contains: [{
	type: 'string',
	maxLength: 255,
}, {
	type: 'null',
}],
},
		password: {
	type: 'string',
	isRequired: true,
	maxLength: 40,
	minLength: 8,
},
	},
} as const;

export const $UserPublic = {
	properties: {
		email: {
	type: 'string',
	isRequired: true,
	format: 'email',
	maxLength: 255,
},
		is_active: {
	type: 'boolean',
	default: true,
},
		is_superuser: {
	type: 'boolean',
	default: false,
},
		full_name: {
	type: 'any-of',
	contains: [{
	type: 'string',
	maxLength: 255,
}, {
	type: 'null',
}],
},
		id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $UsersPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'UserPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $ValidationError = {
	properties: {
		loc: {
	type: 'array',
	contains: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'number',
}],
},
	isRequired: true,
},
		msg: {
	type: 'string',
	isRequired: true,
},
		type: {
	type: 'string',
	isRequired: true,
},
	},
} as const;