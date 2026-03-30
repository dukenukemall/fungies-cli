#!/usr/bin/env node
import {run, handle} from "@oclif/core";
run(process.argv.slice(2)).catch(handle);
