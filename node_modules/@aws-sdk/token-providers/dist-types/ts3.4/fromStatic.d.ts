import { Token, TokenProvider } from "@aws-sdk/types";
export interface FromStaticInit {
  token?: Token;
}
export declare const fromStatic: ({ token }: FromStaticInit) => TokenProvider;
