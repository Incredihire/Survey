export type HTTPValidationError = {
	detail?: Array<ValidationError>;
};



export type InquiryCreate = {
	text: string;
	theme_id: number | null;
	first_scheduled: string | null;
};



export type InquiryPublic = {
	text: string;
	theme_id: number | null;
	first_scheduled: string | null;
	id: number;
	created_at: string;
	theme?: ThemePublic | null;
};



export type InquiryUpdate = {
	text: string;
	theme_id: number | null;
	first_scheduled: string | null;
	id: number;
};



export type InquriesPublic = {
	data: Array<InquiryPublic>;
	count: number;
};



export type Message = {
	message: string;
};



export type ScheduleCreate = {
	schedule: ScheduleInfo;
};



export type ScheduleInfo = {
	startDate: string;
	endDate: string | null;
	daysBetween: number;
	skipWeekends: boolean;
	skipHolidays: boolean;
	timesOfDay: Array<string>;
};



export type ScheduleInquiriesAndDates = {
	inquiries: Array<number>;
	dates: Array<string>;
};



export type SchedulePublic = {
	schedule: ScheduleInfo;
	id: number | null;
	scheduled_inquiries: Array<number>;
	scheduled_inquiries_and_dates: ScheduleInquiriesAndDates;
};



export type ThemeCreate = {
	name: string;
	description?: string | null;
};



export type ThemePublic = {
	name: string;
	description?: string | null;
	id: number;
};



export type ThemesPublic = {
	data: Array<ThemePublic>;
	count: number;
};



export type UserCreate = {
	email: string;
	is_active?: boolean;
	is_superuser?: boolean;
	full_name?: string | null;
	password: string;
};



export type UserPublic = {
	email: string;
	is_active?: boolean;
	is_superuser?: boolean;
	full_name?: string | null;
	id: number;
};



export type UsersPublic = {
	data: Array<UserPublic>;
	count: number;
};



export type ValidationError = {
	loc: Array<string | number>;
	msg: string;
	type: string;
};

