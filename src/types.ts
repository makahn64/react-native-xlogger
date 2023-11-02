import Reactotron from 'reactotron-react-native';

export type ReactotronInstance = typeof Reactotron;
export type Message = Record<string, unknown> | string | number;

export enum LogLevel {
  silent ,
  error,
  warn ,
  debug ,
  info,
  verbose,
  silly
}

export interface XLoggerConfig {
  logLevel: LogLevel;
  useCorrespondingConsoleMethod: boolean;
  printLogLevel: boolean;
  printLogTime: boolean;
  reactotronInstance?: ReactotronInstance;
  useReactotron: boolean;
}
