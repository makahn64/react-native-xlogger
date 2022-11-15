# react-native-xlogger
A very simple logger for React Native that supports console, Reactotron and Sentry. There are more complex loggers 
available that support pluggable transport. This ain't that.

If you're looking for a more feature rich logger that supports multiple, and self-written, transports, check out: 
https://github.com/onubo/react-native-logs.

## TL;DR;

1. Import and configure XLogger
2. Calls to `XLogger.logXXX` will then format and forward messages to `console`, Reactotron and Sentry depending on the 
config and log level settings.
   
```typescript
    import * as XLogger from 'react-native-xlogger';
    const { LogLevel } = XLogger;

    XLogger.configure({
        logLevel: __DEV__ ? LogLevel.silly : LogLevel.warn,
        printLogLevel: true,
        printLogTime: true,
        useSentry: true,
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
- `LogLevel.error`: equivalent of `console.error`. Maps to `Severity.Error` for Sentry 
- `LogLevel.warn`: equivalent of `console.warn`.   Maps to `Severity.Warning` for Sentry
- `LogLevel.debug`: equivalent of `console.log`. Maps to `Severity.Debug` for Sentry
- `LogLevel.info`: equivalent of `console.log`. Maps to `Severity.Log` for Sentry 
- `LogLevel.verbose`: equivalent of `console.log`. Maps to `Severity.Debug` for Sentry
- `LogLevel.silly`: equivalent of `console.log`. Maps to `Severity.Debug` for Sentry

When a log level is set for RNX, messages of that level and above are enabled. For example, if you set the
log level to `debug` then only `debug`, `warn` and `error` messages will be logged.

Sentry has additional default squelch settings in order to reduce noise on the Sentry Dashboard (see below).

## Console Logger

RNX uses `console` to log to the JS console. The method chosen (`.log`, `.warn` or `.error`) depends on the log level 
and the `useCorrespondingConsoleMethod` config boolean. You may want to disable the corresponding method feature,
and use only `console.log`, if your app is throwing a lot of noisy red/yellow screen RN errors.

| Log Level  |  `useCorrespondingConsoleMethod` | console method  |
|------------|--------------------------------|-------------------|
| `error`    |  `true`                          | `console.error` |
|            |  `false`                         | `console.log`   |
| `warn`     | `true`                           | `console.warn`  |
|            | `false`                          | `console.log`   |
| All others | `true`/`false`                   | `console.log`   |

The console logger also supports prepending string messages with time and/or log level.

Setting `printLogLevel` to true will prepend strings with the level. For example:

    [ warn ] Something possibly bad happened.

Setting `printLogTime` to true will prepend strings with the current `hh:mm:ss.ms`. For example:

    [ 13:27.51.265 ] Something happened.

They can be combined:

    [ 13:27.51.265 ][ error ] Something bad happened around 130 PM.

*Note: Prepending with the time and level is only for console logs. Reactotron and Sentry have their own mechanisms 
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

## Sentry Logger

The Sentry logger wraps `Sentry.captureMessage` and `Sentry.captureException`. `Sentry.captureEvent` is not supported,
but of course, you can still use this method in your own code.

The Sentry logger will only automatically forward `LogLevel.warn` and `LogLevel.error` to Sentry 
*regardless of the log level* (as long as the log level is `warn` or higher).  This is to prevent too much noise
from going to Sentry. 

OK, that was probably confusing. Here's how it works:
1. Inbound messages are filtered per the log level and then forwarded to the Sentry logger.
2. If the filtered message is a `warn` or `error` it will be sent to Sentry by default. (See the BypassParams below for
more clarity).

Like the Reactotron logger, the Sentry logger has some special purpose methods. These all map to `Sentry.captureMessage`,
but map the `Severity` differently in order to support levels that RNX does not have.

| Method                            | Maps to                              |
|-----------------------------------|--------------------------------------|
| XLogger.sentry.log                |  `Sentry.captureMessage` with `Severity` set according to the mapping shown in Log Levels, above  |
| XLogger.sentry.logFatal           |  `Sentry.captureMessage` with `Severity.Fatal`               |

## API

### `XLogger.configure(params: Partial<XLoggerConfig>)`
Configures XLogger on startup. Params are defined in the interface `XLoggerConfig`. 
  
Any or all params can be passed:

- `logLevel: LogLevel`: one of the log levels available in the enum LogLevel. Defaults to `.debug`.
- `useCorrespondingConsoleMethod: boolean`: see above. Defaults to `true`
- `useSentry: boolean`: turn on/off Sentry logging. Defaults to `false`.
- `printLogLevel: boolean`: see above, defaults to `false`.
- `printLogTime: boolean`: see above, defaults to `false`.
- `reactotronInstance?: ReactotronInstance`: defaults to `undefined`.
- `useReactotron: boolean`: defaults to `false`

All of these parameters have corresponding setters shown below.

### Logging Methods

All logging methods have the same call signature. Example:

    XLogger.logDebug( message: Message, bypassParams?: BypassParams );

`message` can be a primitive (string, number) or an object.
`bypassParams` is an optional object with the shape `{ bypassReactotron: boolean, bypassSentry: boolean }`. You would use this
optional parameter to squelch specific messages from going to either Reactotron or Sentry. There are defaults are shown
below for each log level.

As an example of using bypass, let's say you had a specific `.warn` message you wanted to see in `console` and Reactotron, but not 
forward to Sentry. You would:

    XLogger.warn('Do not send to Sentry', { bypassSentry: true });

| Method                 | Synonym           | Bypass Defaults                                    |
|------------------------|-------------------|----------------------------------------------------|
| `XLogger.logError`       | `.error`          | `{ bypassReactotron: false , bypassSentry: false }` |
| `XLogger.logWarn`        | `.warn`           | `{ bypassReactotron: false , bypassSentry: false }` |
| `XLogger.logDebug`       | `.log`, `.debug`  | `{ bypassReactotron: false , bypassSentry: true }` |
| `XLogger.logInfo`        | `.info`           | `{ bypassReactotron: false , bypassSentry: true }` |
| `XLogger.logVerbose`     | `.verbose`        | `{ bypassReactotron: false , bypassSentry: true }` |
| `XLogger.logSilly`       | `.silly  `        | `{ bypassReactotron: false , bypassSentry: true }` |
| `XLogger.out`            | none              | `{ bypassReactotron: false , bypassSentry: true }` |

`XLogger.out` is a special case that ignores all log levels except `.silent` and will call the following:
- `console.log`
- `Reactotron.log` if Reactotron is enabled.
- `Sentry.captureMessage` (by way of XLogger.sentry.log) with `Severity.Log`. Note that if you want this call to actually hit Sentry, you need to set `bypassSentry` to `false`.

### Additional Configuration Methods

`XLogger.setReactronInstance(instance: ReactotronInstance)` is used to set the configured Reactotron instance. You don't need to
call this if you have passed it in the `configure` call above.

`XLogger.setUseReactotron(shouldUse: boolean)`: turn on/off Reactotron logging.

`XLogger.setUseSentry(shouldUse: boolean)`: turn on/off Sentry logging.

`XLogger.setLogLevel(level: LogLevel)`: self explanatory :).

`Xlogger.setUseCorrespondingConsoleMethod(shouldUse: boolean)`: see explanation of this flag above.



