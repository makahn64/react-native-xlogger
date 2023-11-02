/*********************************
 File:       xlogger.ts
 Function:   Xlogger in typescript
 Copyright:  Bertco LLC
 Date:       2020-02-14
 Author:     mkahn
 **********************************/

import * as Reactolog from './reactolog';
import {LogLevel, Message, XLoggerConfig, ReactotronInstance} from './types';
import {descriptionForLevel} from "./helpers";

const DEFAULT_CONFIG: XLoggerConfig = {
  logLevel: LogLevel.debug,
  useCorrespondingConsoleMethod: true,
  reactotronInstance: undefined,
  useReactotron: false,
  printLogLevel: true,
  printLogTime: false,
}

let currentConfig = DEFAULT_CONFIG;

export const setReactronInstance = (instance: ReactotronInstance) => {
  currentConfig.reactotronInstance = instance;
  Reactolog.setReactotronInstance(instance);
}

export const configure = (settings: Partial<XLoggerConfig>) => {
  currentConfig = {
    logLevel: settings?.logLevel || DEFAULT_CONFIG.logLevel,
    useCorrespondingConsoleMethod: settings?.useCorrespondingConsoleMethod ||
      DEFAULT_CONFIG.useCorrespondingConsoleMethod,
    reactotronInstance: settings?.reactotronInstance || DEFAULT_CONFIG.reactotronInstance,
    useReactotron: settings?.useReactotron || DEFAULT_CONFIG.useReactotron,
    printLogLevel: settings?.printLogLevel || DEFAULT_CONFIG.printLogLevel,
    printLogTime: settings?.printLogTime || DEFAULT_CONFIG.printLogTime
  }
  if (settings?.reactotronInstance){
    Reactolog.setReactotronInstance(settings.reactotronInstance);
  }
}

const appendPrefixes = (message: Message | Error, logLevel: LogLevel) => {
  const t = typeof message; // instanceof doesn't work on literals
  if ( t === 'string' || t === 'number') {
    const llPrefix = currentConfig.printLogLevel ? `[${descriptionForLevel(logLevel)}]` : '';
    const now = new Date();
    const ltPrefix = currentConfig.printLogTime ?
      `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}]` : '';
    return `${ltPrefix}${llPrefix}  ${message}`;
  }
  // no prefixes on objects
  return message;
}

export type BypassParams = { bypassReactotron: boolean; };

const logIfLevelLegit = (message: Message | Error, bypassParams: BypassParams, level: LogLevel) => {
  const { bypassReactotron } = bypassParams;
  if (level <= currentConfig.logLevel) {
    if (level === LogLevel.error && currentConfig.useCorrespondingConsoleMethod) {
      // eslint-disable-next-line no-console
      console.error(appendPrefixes(message, level));
    } else if (level === LogLevel.warn && currentConfig.useCorrespondingConsoleMethod) {
      // eslint-disable-next-line no-console
      console.warn(appendPrefixes(message, level));
    } else {
      // eslint-disable-next-line no-console
      console.log(appendPrefixes(message, level));
    }
    if (currentConfig.reactotronInstance && !bypassReactotron) {
      Reactolog.log(message);
    }
  }
};

/**
 * Sets the logLevel, if it is in the list of legit ones above.
 * @param level
 */
export const setLogLevel = (level: LogLevel) => {
  currentConfig.logLevel = level;
};

/**
 * Enables/disables Reactotron logging
 * @param shouldUse
 */
export const setUseReactotron = (shouldUse: boolean) => {
  currentConfig.useReactotron = shouldUse;
};

/**
 * Maps logWarn to console.warn, and logError to console.error
 * @param shouldUse
 */
export const setUseCorrespondingConsoleMethod = (shouldUse: boolean) => {
  currentConfig.useCorrespondingConsoleMethod = shouldUse;
};

/**
 * Always log out, bypass log level unless silent.
 * @param message
 * @param bypassParams
 */
export const out = (message: Message, bypassParams: BypassParams = { bypassReactotron: false } ) => {
  if (currentConfig.logLevel !== LogLevel.silent) {
    // eslint-disable-next-line no-console
    console.log(message);
    if (currentConfig.useReactotron && !bypassParams.bypassReactotron) {
      Reactolog.log(message);
    }
  }
};

export const logSilly = (message: Message, bypassParams: BypassParams = { bypassReactotron: false }) => logIfLevelLegit
(message, bypassParams, LogLevel.silly);

export const logVerbose = (message: Message, bypassParams: BypassParams = { bypassReactotron: false }) =>
  logIfLevelLegit(message, bypassParams, LogLevel.verbose);

export const logInfo = (message: Message, bypassParams: BypassParams = { bypassReactotron: false }) =>
  logIfLevelLegit(message, bypassParams, LogLevel.info);

// for Warn level
export const logWarn = (message: Message, bypassParams: BypassParams = { bypassReactotron: false }) =>
  logIfLevelLegit(message, bypassParams, LogLevel.warn);

export const logError = (message: Message | Error, bypassParams: BypassParams = { bypassReactotron: false }) =>
  logIfLevelLegit(message,bypassParams, LogLevel.error);

export const logDebug = (message: Message, bypassParams: BypassParams = { bypassReactotron: false }) =>
  logIfLevelLegit(message, bypassParams, LogLevel.debug);

// direct access, only if turned on.
export const reactotron = {
  log: (message: Message) => {
    if (currentConfig.useReactotron) {
      Reactolog.log(message);
    }
  },
  logImportant: (message: Message) => {
    if (currentConfig.useReactotron) {
      Reactolog.logImportant(message);
    }
  },
  display: (object: Message) => {
    if (currentConfig.useReactotron) {
      Reactolog.display(object);
    }
  },
};

// synonyms
export const silly = logSilly;
export const verbose = logVerbose;
export const info = logInfo;
export const warn = logWarn;
export const error = logError;
export const debug = logDebug;
// backwards compatible, kind of, with the old confusing `log` method.
export const log = logDebug;
