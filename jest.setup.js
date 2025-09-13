import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "util";
Object.assign(global, { TextEncoder, TextDecoder });

import "whatwg-fetch";
import { Request, Response } from 'whatwg-fetch';
Object.assign(global, { Request, Response, fetch });