#!/usr/bin/env node

import { run } from "./cli/run.js";

const exitCode = await run();
process.exitCode = exitCode;

