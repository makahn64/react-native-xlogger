/*********************************
 File:       sentry.js
 Function:   Does Sentry logging
 Copyright:  Bertco LLC
 Date:       2021-06-08
 Author:     mkahn
 **********************************/

import * as Sentry from '@sentry/react-native';
import { Breadcrumb, Exception } from '@sentry/react-native';
import {LogLevel, Message} from './types';
import {isStringOrNumber} from "./helpers";

// Severity has additional levels like Fatal and Critical that we're not using
const mapLogLevelToSeverity = (logLevel: LogLevel): Breadcrumb['level'] => {
  switch (logLevel) {
    case LogLevel.silent:
    case LogLevel.silly:
    case LogLevel.debug:
      return 'debug';
    case LogLevel.warn:
      return 'warning';
    case LogLevel.info:
      return 'log';
    case LogLevel.error:
      return 'error';
  }
  return 'log';
}

// if it's a primitive, sent it directly, otherwise stringify
const reduceToSentryMessage = (message: Message | Error) => isStringOrNumber(message) ? `${message}` : JSON.stringify(message);

const captureMessage = (message: Message | Error, severity: Breadcrumb['level']) => {
    Sentry.captureMessage( reduceToSentryMessage(message), severity);
}

export const log = (message: Message | Error, logLevel: LogLevel ) => {
   captureMessage( message, mapLogLevelToSeverity(logLevel));
};

export const logFatal = (message: Message) => {
  captureMessage(message, 'fatal')
};

// this is probably not useful
export const captureException = (e: Exception) => {
    Sentry.captureException(e);
};
