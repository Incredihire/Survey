import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type { InquiryCreate,InquiryPublic,InquiryUpdate,InquriesPublic,Message,ThemeCreate,ThemePublic,ThemesPublic,UserCreate,UserPublic,UsersPublic,ScheduleCreate,SchedulePublic } from './models';

export type AuthData = {
        AuthCallback: {
                    code: string
state: string
                    
                };
    }

export type InquiriesData = {
        CreateInquiry: {
                    requestBody: InquiryCreate
                    
                };
UpdateInquiry: {
                    requestBody: InquiryUpdate
                    
                };
GetInquries: {
                    limit?: number
skip?: number
                    
                };
DeleteInquiry: {
                    inquiryId: number
                    
                };
ReadInquiry: {
                    inquiryId: number
                    
                };
    }

export type ThemesData = {
        CreateTheme: {
                    requestBody: ThemeCreate
                    
                };
GetThemes: {
                    limit?: number
skip?: number
                    
                };
ReadTheme: {
                    themeId: number
                    
                };
    }

export type UsersData = {
        ReadUsers: {
                    limit?: number
skip?: number
                    
                };
CreateUser: {
                    requestBody: UserCreate
                    
                };
ReadUserById: {
                    userId: number
                    
                };
DeleteUser: {
                    userId: number
                    
                };
    }

export type UtilsData = {
        TestEmail: {
                    emailTo: string
                    
                };
    }

export type ScheduleData = {
        CreateSchedule: {
                    requestBody: ScheduleCreate
                    
                };
UpdateScheduledInquiries: {
                    requestBody: Array<number>
                    
                };
    }

export class AuthService {

	/**
	 * Login
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static login(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/auth/login',
		});
	}

	/**
	 * Auth Callback
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static authCallback(data: AuthData['AuthCallback']): CancelablePromise<unknown> {
		const {
code,
state,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/auth/callback',
			query: {
				code, state
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Refresh
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static refresh(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/auth/refresh',
		});
	}

}

export class InquiriesService {

	/**
	 * Create Inquiry
	 * Create new inquiry.
	 * @returns InquiryPublic Successful Response
	 * @throws ApiError
	 */
	public static createInquiry(data: InquiriesData['CreateInquiry']): CancelablePromise<InquiryPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/inquiries/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Inquiry
	 * Update inquiry.
	 * @returns InquiryPublic Successful Response
	 * @throws ApiError
	 */
	public static updateInquiry(data: InquiriesData['UpdateInquiry']): CancelablePromise<InquiryPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/inquiries/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Inquries
	 * Retrieve inquries.
	 * @returns InquriesPublic Successful Response
	 * @throws ApiError
	 */
	public static getInquries(data: InquiriesData['GetInquries'] = {}): CancelablePromise<InquriesPublic> {
		const {
skip = 0,
limit = 100,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/inquiries/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Inquiry
	 * Delete inquiry.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static deleteInquiry(data: InquiriesData['DeleteInquiry']): CancelablePromise<Message> {
		const {
inquiryId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/inquiries/{inquiry_id}',
			path: {
				inquiry_id: inquiryId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Inquiry
	 * Get inquiry by ID
	 * @returns InquiryPublic Successful Response
	 * @throws ApiError
	 */
	public static readInquiry(data: InquiriesData['ReadInquiry']): CancelablePromise<InquiryPublic> {
		const {
inquiryId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/inquiries/{inquiry_id}',
			path: {
				inquiry_id: inquiryId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class ThemesService {

	/**
	 * Create Theme
	 * Create new theme.
	 * @returns ThemePublic Successful Response
	 * @throws ApiError
	 */
	public static createTheme(data: ThemesData['CreateTheme']): CancelablePromise<ThemePublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/themes/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Themes
	 * Retrieve themes.
	 * @returns ThemesPublic Successful Response
	 * @throws ApiError
	 */
	public static getThemes(data: ThemesData['GetThemes'] = {}): CancelablePromise<ThemesPublic> {
		const {
skip = 0,
limit = 100,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/themes/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Theme
	 * Get theme by ID
	 * @returns ThemePublic Successful Response
	 * @throws ApiError
	 */
	public static readTheme(data: ThemesData['ReadTheme']): CancelablePromise<ThemePublic> {
		const {
themeId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/themes/{theme_id}',
			path: {
				theme_id: themeId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class UsersService {

	/**
	 * Read Users
	 * Retrieve users.
	 * @returns UsersPublic Successful Response
	 * @throws ApiError
	 */
	public static readUsers(data: UsersData['ReadUsers'] = {}): CancelablePromise<UsersPublic> {
		const {
skip = 0,
limit = 100,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/users/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create User
	 * Create new user.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static createUser(data: UsersData['CreateUser']): CancelablePromise<UserPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read User Me
	 * Get current user.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static readUserMe(): CancelablePromise<UserPublic> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/users/me',
		});
	}

	/**
	 * Delete User Me
	 * Delete own user.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static deleteUserMe(): CancelablePromise<Message> {
				return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/users/me',
		});
	}

	/**
	 * Read User By Id
	 * Get a specific user by id.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static readUserById(data: UsersData['ReadUserById']): CancelablePromise<UserPublic> {
		const {
userId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/users/{user_id}',
			path: {
				user_id: userId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete User
	 * Delete a user.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static deleteUser(data: UsersData['DeleteUser']): CancelablePromise<Message> {
		const {
userId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/users/{user_id}',
			path: {
				user_id: userId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class UtilsService {

	/**
	 * Test Email
	 * Test emails.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static testEmail(data: UtilsData['TestEmail']): CancelablePromise<Message> {
		const {
emailTo,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/utils/test-email/',
			query: {
				email_to: emailTo
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class ScheduleService {

	/**
	 * Get Schedule
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getSchedule(): CancelablePromise<SchedulePublic | null> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/schedule/',
		});
	}

	/**
	 * Create Schedule
	 * @returns SchedulePublic Successful Response
	 * @throws ApiError
	 */
	public static createSchedule(data: ScheduleData['CreateSchedule']): CancelablePromise<SchedulePublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/schedule/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Scheduled Inquiries
	 * @returns SchedulePublic Successful Response
	 * @throws ApiError
	 */
	public static updateScheduledInquiries(data: ScheduleData['UpdateScheduledInquiries']): CancelablePromise<SchedulePublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/schedule/update_scheduled_inquiries',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

}