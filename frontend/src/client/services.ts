import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type { Body_login_login_access_token,Token,UserPublic,InquiryCreate,InquiryPublic,InquriesPublic,ThemeCreate,ThemePublic,ThemesPublic,Message,UserCreate,UsersPublic,ScheduledInquiriesPublic,ScheduledInquiryCreate,ScheduledInquiryPublic,ScheduleCreate,SchedulePublic } from './models';

export type LoginData = {
        LoginAccessToken: {
                    formData: Body_login_login_access_token
                    
                };
    }

export type InquiriesData = {
        CreateInquiry: {
                    requestBody: InquiryCreate
                    
                };
GetInquries: {
                    limit?: number
skip?: number
                    
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

export type ScheduledInquiriesData = {
        AddToSchedule: {
                    requestBody: ScheduledInquiryCreate
                    
                };
GetScheduledInquries: {
                    limit?: number
skip?: number
                    
                };
    }

export type ScheduleData = {
        CreateSchedule: {
                    requestBody: ScheduleCreate
                    
                };
    }

export class LoginService {

	/**
	 * Login Access Token
	 * OAuth2 compatible token login, get an access token for future requests
	 * @returns Token Successful Response
	 * @throws ApiError
	 */
	public static loginAccessToken(data: LoginData['LoginAccessToken']): CancelablePromise<Token> {
		const {
formData,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/login/access-token',
			formData: formData,
			mediaType: 'application/x-www-form-urlencoded',
			errors: {
				422: `Validation Error`,
			},
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

export class ScheduledInquiriesService {

	/**
	 * Add To Schedule
	 * @returns ScheduledInquiryPublic Successful Response
	 * @throws ApiError
	 */
	public static addToSchedule(data: ScheduledInquiriesData['AddToSchedule']): CancelablePromise<ScheduledInquiryPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/scheduledinquiries/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Scheduled Inquries
	 * @returns ScheduledInquiriesPublic Successful Response
	 * @throws ApiError
	 */
	public static getScheduledInquries(data: ScheduledInquiriesData['GetScheduledInquries'] = {}): CancelablePromise<ScheduledInquiriesPublic> {
		const {
skip = 0,
limit = 100,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/scheduledinquiries/',
			query: {
				skip, limit
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

}