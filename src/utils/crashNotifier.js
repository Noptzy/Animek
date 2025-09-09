let registered = false;

function initializeCrashNotifier() {
    if (registered) return; 
    registered = true;

    process.on('uncaughtExceptionMonitor', () => {
        console.log('[app.crash] See logs/error-<date>.log for details');
    });

    process.on('unhandledRejection', () => {
        console.log('[app.crash] See logs/error-<date>.log for details');
    });
}

module.exports = { initializeCrashNotifier };
