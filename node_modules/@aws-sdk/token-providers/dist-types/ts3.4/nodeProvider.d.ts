import { TokenProvider } from "@aws-sdk/types";
import { FromSsoInit } from "./fromSso";
export declare const nodeProvider: (init?: FromSsoInit) => TokenProvider;
