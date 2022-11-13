import { SourceProfileInit } from "@aws-sdk/shared-ini-file-loader";
import { TokenProvider } from "@aws-sdk/types";
export interface FromSsoInit extends SourceProfileInit {}
export declare const fromSso: (init?: FromSsoInit) => TokenProvider;
