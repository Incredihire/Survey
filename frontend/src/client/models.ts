export type Body_login_login_access_token = {
	grant_type?: string | null;
	username: string;
	password: string;
	scope?: string;
	client_id?: string | null;
	client_secret?: string | null;
};



export type HTTPValidationError = {
	detail?: Array<ValidationError>;
};



export type InquiryCreate = {
	text: string;
};



export type InquiryPublic = {
	text: string;
	id: number;
	created_at: string;
};



export type InquriesPublic = {
	data: Array<InquiryPublic>;
	count: number;
};



export type Message = {
	message: string;
};



export type NewPassword = {
	token: string;
	new_password: string;
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



export type Token = {
	access_token: string;
	token_type?: string;
};



export type UpdatePassword = {
	current_password: string;
	new_password: string;
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



export type UserRegister = {
	email: string;
	password: string;
	full_name?: string | null;
};



export type UserUpdate = {
	email?: string | null;
	is_active?: boolean;
	is_superuser?: boolean;
	full_name?: string | null;
	password?: string | null;
};



export type UserUpdateMe = {
	full_name?: string | null;
	email?: string | null;
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

