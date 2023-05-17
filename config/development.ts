import * as secret from './secret';

export const mongo_path = "mongodb://host.docker.internal:27017/auth";
export const session_secret = "${random_value}";
export const hash_salt = "${random_value}";
export const oauth_domain = secret.oauth_domain;
export const client_name = "auth";
export const client_secret = secret.client_secret;
export const admin_user_name = "admin";