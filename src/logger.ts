import fetch from 'cross-fetch';
import { EndpointType, getIngestURL } from './config';
const _debounce = require('lodash/debounce');

const debouncedSendLogs = _debounce(() => sendLogs(), 1000);

let collectedLogs: any[] = [];

function _log(level: string, message: string, args: any = {}) {
  const l = { level, message, _time: new Date(Date.now()).toISOString() };
  if (Object.keys(args).length > 0) {
    l['fields'] = args;
  }
  collectedLogs.push(l);
  debouncedSendLogs();
}

export const log = {
  debug: (message: string, args: any = {}) => _log('debug', message, args),
  info: (message: string, args: any = {}) => _log('info', message, args),
  warn: (message: string, args: any = {}) => _log('warn', message, args),
  error: (message: string, args: any = {}) => _log('error', message, args),
};

async function sendLogs() {
  let url = '/axiom/logs';
  // check if running in nodejs and add baseURL so that
  // fetch works correctly
  if (typeof window !== "object") {
    url = getIngestURL(EndpointType.logs);
  }
  const body = JSON.stringify(collectedLogs);

  if (typeof window !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    await fetch(url, { body, method: 'POST', keepalive: true });
  }
  // clear collected logs
  collectedLogs = [];
}
