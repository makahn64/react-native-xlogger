# react-native-xlogger
A very simple logger for React Native that supports console, Reactotron. There are more complex loggers 
available that support pluggable transport. This ain't that.

If you're looking for a more feature rich logger that supports multiple, and self-written, transports, check out: 
https://github.com/onubo/react-native-logs.

## TL;DR;

1. Import and configure XLogger
2. Calls to `XLogger.logXXX` will then format and forward messages to `console`, Reactotron depending on the 
config and log level settings.
   
```typescript
    import * as XLogger from 'react-native-xlogger';
    const { LogLevel } = XLogger;

    XLogger.configure({
        logLevel: __DEV__ ? LogLevel.silly : LogLevel.warn,
        printLogLevel: true,
        printLogTime: true,
        useReactotron: __DEV__,
        reactotronInstance: __DEV__ ? configuredReactotron : undefined,
    });

    XLogger.silly('This is a silly message');
    // squelch the logger
    XLogger.setLogLevel( LogLevel.silent );
```

## Log Levels

RNX supports the following log levels:
- `LogLevel.silent`: all logs, except direct logs (see below), are squelched 
- `LogLevel.error`: equivalent of `console.error`. 
- `LogLevel.warn`: equivalent of `console.warn`.
- `LogLevel.debug`: equivalent of `console.log`.
- `LogLevel.info`: equivalent of `console.log`. 
- `LogLevel.verbose`: equivalent of `console.log`.
- `LogLevel.silly`: equivalent of `console.log`.

When a log level is set for RNX, messages of that level and above are enabled. For example, if you set the
log level to `debug` then only `debug`, `warn` and `error` messages will be logged.

## Console Logger

RNX uses `console` to log to the JS console. The method chosen (`.log`, `.warn` or `.error`) depends on the log level 
and the `useCorrespondingConsoleMethod` config boolean. You may want to disable the corresponding method feature,
and use only `console.log`, if your app is throwing a lot of noisy red/yellow screen RN errors.

| Log Level  | `useCorrespondingConsoleMethod` | console method  |
|------------|---------------------------------|-----------------|
| `error`    | `true`                          | `console.error` |
|            | `false`                         | `console.log`   |
| `warn`     | `true`                          | `console.warn`  |
|            | `false`                         | `console.log`   |
| All others | `true`/`false`                  | `console.log`   |

The console logger also supports prepending string messages with time and/or log level.

Setting `printLogLevel` to true will prepend strings with the level. For example:

    [ warn ] Something possibly bad happened.

Setting `printLogTime` to true will prepend strings with the current `hh:mm:ss.ms`. For example:

    [ 13:27.51.265 ] Something happened.

They can be combined:

    [ 13:27.51.265 ][ error ] Something bad happened around 130 PM.

*Note: Prepending with the time and level is only for console logs. Reactotron has its own mechanisms 
for this. Also, prepending does not occur for parameters that are not a string or number (for obvious reasons).*

## Reactotron Logger

One of the reasons XLogger was written was to avoid the suggested "monkey patching" of `console` by the
Reactotron team ("`console.tron`"). In XLogger, all Reactotron calls are wrapped to enable easy disable of Reactotron
in production. This wrapping also checks to see whether a configured Reactotron instance exists before trying to
log. The monkey patching approach does not do this, and can result in crashes.

To enable Reactotron logging, you must pass *both* a configured Reactotron instance *and* enable it with the `useReactotron` 
flag. In addition, you can directly access special purpose Reactotron log methods via the `XLogger.reactotron` object.

| Method                            | Maps to                              |
|-----------------------------------|--------------------------------------|
| XLogger.reactotron.log            |  Reactotron.log                      |
| XLogger.rectotron.logImportant    |  Reactotron.logImportant             |
| XLogger.rectotron.display         |  Reactotron.display                  |

Why would you use `XLogger.reactotron` instead of calling the Reactotron methods directly? To avoid issues in 
production with a non-existent Reactotron instance, of course!

## API

### `XLogger.configure(params: Partial<XLoggerConfig>)`
Configures XLogger on startup. Params are defined in the interface `XLoggerConfig`. 
  
Any or all params can be passed:

- `logLevel: LogLevel`: one of the log levels available in the enum LogLevel. Defaults to `.debug`.
- `useCorrespondingConsoleMethod: boolean`: see above. Defaults to `true`
- `printLogLevel: boolean`: see above, defaults to `false`.
- `printLogTime: boolean`: see above, defaults to `false`.
- `reactotronInstance?: ReactotronInstance`: defaults to `undefined`.
- `useReactotron: boolean`: defaults to `false`

All of these parameters have corresponding setters shown below.

### Logging Methods

All logging methods have the same call signature. Example:

    XLogger.logDebug( message: Message, bypassParams?: BypassParams );

`message` can be a primitive (string, number) or an object.
`bypassParams` is an optional object with the shape `{ bypassReactotron: boolean }`. You would use this
optional parameter to squelch specific messages from going to Reactotron. There are defaults are shown
below for each log level.

| Method               | Synonym          | Bypass Defaults               |
|----------------------|------------------|-------------------------------|
| `XLogger.logError`   | `.error`         | `{ bypassReactotron: false }` |
| `XLogger.logWarn`    | `.warn`          | `{ bypassReactotron: false }` |
| `XLogger.logDebug`   | `.log`, `.debug` | `{ bypassReactotron: false }` |
| `XLogger.logInfo`    | `.info`          | `{ bypassReactotron: false }` |
| `XLogger.logVerbose` | `.verbose`       | `{ bypassReactotron: false }` |
| `XLogger.logSilly`   | `.silly  `       | `{ bypassReactotron: false }` |
| `XLogger.out`        | none             | `{ bypassReactotron: false }` |

`XLogger.out` is a special case that ignores all log levels except `.silent` and will call the following:
- `console.log`
- `Reactotron.log` if Reactotron is enabled.

### Additional Configuration Methods

`XLogger.setReactronInstance(instance: ReactotronInstance)` is used to set the configured Reactotron instance. You don't need to
call this if you have passed it in the `configure` call above.

`XLogger.setUseReactotron(shouldUse: boolean)`: turn on/off Reactotron logging.

`XLogger.setLogLevel(level: LogLevel)`: self explanatory :).

`Xlogger.setUseCorrespondingConsoleMethod(shouldUse: boolean)`: see explanation of this flag above.



