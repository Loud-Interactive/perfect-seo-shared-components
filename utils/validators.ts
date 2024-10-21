// const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const URL_REGEX = /^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
const DOMAIN_REGEX = /^(((?!-))(xn--|_)?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9\-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$/;
const YOUTUBE_URL_REGEX = /(?:https:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/)(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/)([a-zA-Z0-9\_-]+){11}/;
const PASSWORD_REGEX = /^([A-Za-z0-9^$*.[\]{}()?"!@#%&\/,><':;|_~`=+-])/;
const US_PHONE_REGEX = /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/;

export interface Validator {
  test: (value: string, formState?: Record<string, any>) => boolean;
  message: string;
}

export const emailValidator: Validator = {
  test: email => EMAIL_REGEX.test(email),
  message: 'Please enter a valid email address.',
};

export const urlValidator: Validator = {
  test: url => URL_REGEX.test(url),
  message: 'Please enter a valid URL.',
};
export const domainValidator: Validator = {
  test: url => DOMAIN_REGEX.test(url),
  message: 'Please enter the domain only.',
};

export const youtubeUrlValidator: Validator = {
  test: url => YOUTUBE_URL_REGEX.test(url),
  message: 'Please enter a valid youtube URL.',
};

export const usernameValidator: Validator = {
  test: username => username.length >= 8,
  message: 'Username must be a minimum of 8 characters.',
};

export const passwordValidator: Validator = {
  test: password => PASSWORD_REGEX.test(password) && password.length >= 8,
  message: 'Password must meet all criteria.',
};

export const phoneValidator: Validator = {
  test: phone => US_PHONE_REGEX.test(phone) && phone.length === 14,
  message: 'Please write a valid phone, the format is (000) 000-0000',
};
