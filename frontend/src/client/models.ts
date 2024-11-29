export type HTTPValidationError = {
	detail?: Array<ValidationError>;
};



export type InquiryCreate = {
	text: string;
	theme_id: number | null;
};



export type InquiryDelete = {
	text: string;
	theme_id: number | null;
	id: number;
};



export type InquiryPublic = {
	text: string;
	theme_id: number | null;
	id: number;
	created_at: string;
	theme?: ThemePublic | null;
	scheduled_inquiry?: ScheduledInquiryPublic | null;
};



export type InquiryUpdate = {
	text: string;
	theme_id: number | null;
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



export type SchedulePublic = {
	schedule: ScheduleInfo;
	id: number;
};



export type ScheduledInquiriesPublic = {
	data: Array<ScheduledInquiryPublicWithInquiryText>;
	count: number;
};



export type ScheduledInquiryCreate = {
	inquiry_id: number;
};



export type ScheduledInquiryPublic = {
	inquiry_id: number;
	rank: number;
	id: number;
};



export type ScheduledInquiryPublicWithInquiryText = {
	inquiry_id: number;
	rank: number;
	id: number;
	text: string;
};



export type ScheduledInquiryUpdate = {
	inquiry_id: number;
	rank: number;
	id: number;
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

