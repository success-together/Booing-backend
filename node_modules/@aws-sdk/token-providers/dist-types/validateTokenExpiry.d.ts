import { Token } from "@aws-sdk/types";
/**
 * Throws TokenProviderError is token is expired.
 */
export declare const validateTokenExpiry: (token: Token) => void;
