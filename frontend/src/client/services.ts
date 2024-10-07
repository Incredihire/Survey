import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type { Body_login_login_access_token,Message,NewPassword,Token,UserPublic,InquiryCreate,InquiryPublic,InquriesPublic,ThemeCreate,ThemePublic,ThemesPublic,UpdatePassword,UserCreate,UserRegister,UsersPublic,UserUpdate,UserUpdateMe,ItemCreate,ItemPublic,ItemsPublic,ItemUpdate,ScheduledInquiriesPublic,ScheduledInquiryCreate,ScheduledInquiryPublic,ScheduleCreate,SchedulePublic } from './models';

export type LoginData = {
        LoginLoginAccessToken: {
                    formData: Body_login_login_access_token
                    
                };
LoginRecoverPassword: {
                    email: string
                    
                };
LoginResetPassword: {
                    requestBody: NewPassword
                    
                };
LoginRecoverPasswordHtmlContent: {
                    email: string
                    
                };
    }

export type InquiriesData = {
        InquiriesCreateInquiry: {
                    requestBody: InquiryCreate
                    
                };
InquiriesGetInquries: {
                    limit?: number
skip?: number
                    
                };
InquiriesReadInquiry: {
                    inquiryId: string
                    
                };
    }

export type ThemesData = {
        ThemesCreateTheme: {
                    requestBody: ThemeCreate
                    
                };
ThemesGetThemes: {
                    limit?: number
skip?: number
                    
                };
ThemesReadTheme: {
                    themeId: string
                    
                };
    }

export type UsersData = {
        UsersReadUsers: {
                    limit?: number
skip?: number
                    
                };
UsersCreateUser: {
                    requestBody: UserCreate
                    
                };
UsersUpdateUserMe: {
                    requestBody: UserUpdateMe
                    
                };
UsersUpdatePasswordMe: {
                    requestBody: UpdatePassword
                    
                };
UsersRegisterUser: {
                    requestBody: UserRegister
                    
                };
UsersReadUserById: {
                    userId: string
                    
                };
UsersUpdateUser: {
                    requestBody: UserUpdate
userId: string
                    
                };
UsersDeleteUser: {
                    userId: string
                    
                };
    }

export type UtilsData = {
        UtilsTestEmail: {
                    emailTo: string
                    
                };
    }

export type ItemsData = {
        ItemsReadItems: {
                    limit?: number
skip?: number
                    
                };
ItemsCreateItem: {
                    requestBody: ItemCreate
                    
                };
ItemsReadItem: {
                    id: string
                    
                };
ItemsUpdateItem: {
                    id: string
requestBody: ItemUpdate
                    
                };
ItemsDeleteItem: {
                    id: string
                    
                };
    }

export type ScheduledInquiriesData = {
        ScheduledInquiriesAddToSchedule: {
                    requestBody: ScheduledInquiryCreate
                    
                };
ScheduledInquiriesGetScheduledInquries: {
                    limit?: number
skip?: number
                    
                };
    }

export type ScheduleData = {
        ScheduleCreateSchedule: {
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
	public static loginLoginAccessToken(data: LoginData['LoginLoginAccessToken']): CancelablePromise<Token> {
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

	/**
	 * Test Token
	 * Test access token
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static loginTestToken(): CancelablePromise<UserPublic> {
				return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/login/test-token',
		});
	}

	/**
	 * Recover Password
	 * Password Recovery
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static loginRecoverPassword(data: LoginData['LoginRecoverPassword']): CancelablePromise<Message> {
		const {
email,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/password-recovery/{email}',
			path: {
				email
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Reset Password
	 * Reset password
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static loginResetPassword(data: LoginData['LoginResetPassword']): CancelablePromise<Message> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/reset-password/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Recover Password Html Content
	 * HTML Content for Password Recovery
	 * @returns string Successful Response
	 * @throws ApiError
	 */
	public static loginRecoverPasswordHtmlContent(data: LoginData['LoginRecoverPasswordHtmlContent']): CancelablePromise<string> {
		const {
email,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/password-recovery-html-content/{email}',
			path: {
				email
			},
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
	public static inquiriesCreateInquiry(data: InquiriesData['InquiriesCreateInquiry']): CancelablePromise<InquiryPublic> {
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
	public static inquiriesGetInquries(data: InquiriesData['InquiriesGetInquries'] = {}): CancelablePromise<InquriesPublic> {
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
	public static inquiriesReadInquiry(data: InquiriesData['InquiriesReadInquiry']): CancelablePromise<InquiryPublic> {
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
	public static themesCreateTheme(data: ThemesData['ThemesCreateTheme']): CancelablePromise<ThemePublic> {
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
	public static themesGetThemes(data: ThemesData['ThemesGetThemes'] = {}): CancelablePromise<ThemesPublic> {
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
	public static themesReadTheme(data: ThemesData['ThemesReadTheme']): CancelablePromise<ThemePublic> {
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
	public static usersReadUsers(data: UsersData['UsersReadUsers'] = {}): CancelablePromise<UsersPublic> {
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
	public static usersCreateUser(data: UsersData['UsersCreateUser']): CancelablePromise<UserPublic> {
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
	public static usersReadUserMe(): CancelablePromise<UserPublic> {
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
	public static usersDeleteUserMe(): CancelablePromise<Message> {
				return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/users/me',
		});
	}

	/**
	 * Update User Me
	 * Update own user.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static usersUpdateUserMe(data: UsersData['UsersUpdateUserMe']): CancelablePromise<UserPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/users/me',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Password Me
	 * Update own password.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static usersUpdatePasswordMe(data: UsersData['UsersUpdatePasswordMe']): CancelablePromise<Message> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/users/me/password',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Register User
	 * Create new user without the need to be logged in.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static usersRegisterUser(data: UsersData['UsersRegisterUser']): CancelablePromise<UserPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/signup',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read User By Id
	 * Get a specific user by id.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static usersReadUserById(data: UsersData['UsersReadUserById']): CancelablePromise<UserPublic> {
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
	 * Update User
	 * Update a user.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static usersUpdateUser(data: UsersData['UsersUpdateUser']): CancelablePromise<UserPublic> {
		const {
userId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/users/{user_id}',
			path: {
				user_id: userId
			},
			body: requestBody,
			mediaType: 'application/json',
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
	public static usersDeleteUser(data: UsersData['UsersDeleteUser']): CancelablePromise<Message> {
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
	public static utilsTestEmail(data: UtilsData['UtilsTestEmail']): CancelablePromise<Message> {
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

export class ItemsService {

	/**
	 * Read Items
	 * Retrieve items.
	 * @returns ItemsPublic Successful Response
	 * @throws ApiError
	 */
	public static itemsReadItems(data: ItemsData['ItemsReadItems'] = {}): CancelablePromise<ItemsPublic> {
		const {
skip = 0,
limit = 100,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/items/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Item
	 * Create new item.
	 * @returns ItemPublic Successful Response
	 * @throws ApiError
	 */
	public static itemsCreateItem(data: ItemsData['ItemsCreateItem']): CancelablePromise<ItemPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/items/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Item
	 * Get item by ID.
	 * @returns ItemPublic Successful Response
	 * @throws ApiError
	 */
	public static itemsReadItem(data: ItemsData['ItemsReadItem']): CancelablePromise<ItemPublic> {
		const {
id,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/items/{id}',
			path: {
				id
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Item
	 * Update an item.
	 * @returns ItemPublic Successful Response
	 * @throws ApiError
	 */
	public static itemsUpdateItem(data: ItemsData['ItemsUpdateItem']): CancelablePromise<ItemPublic> {
		const {
id,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/v1/items/{id}',
			path: {
				id
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Item
	 * Delete an item.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static itemsDeleteItem(data: ItemsData['ItemsDeleteItem']): CancelablePromise<Message> {
		const {
id,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/items/{id}',
			path: {
				id
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
	public static scheduledInquiriesAddToSchedule(data: ScheduledInquiriesData['ScheduledInquiriesAddToSchedule']): CancelablePromise<ScheduledInquiryPublic> {
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
	public static scheduledInquiriesGetScheduledInquries(data: ScheduledInquiriesData['ScheduledInquiriesGetScheduledInquries'] = {}): CancelablePromise<ScheduledInquiriesPublic> {
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
	public static scheduleGetSchedule(): CancelablePromise<SchedulePublic | null> {
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
	public static scheduleCreateSchedule(data: ScheduleData['ScheduleCreateSchedule']): CancelablePromise<SchedulePublic> {
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