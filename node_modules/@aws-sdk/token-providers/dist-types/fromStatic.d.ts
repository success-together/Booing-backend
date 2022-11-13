import { Token, TokenProvider } from "@aws-sdk/types";
export interface FromStaticInit {
    token?: Token;
}
/**
 * Creates a token provider that will read from static token.
 */
export declare const fromStatic: ({ token }: FromStaticInit) => TokenProvider;
