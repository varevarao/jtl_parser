import { mean, quantile } from './utils';

const QUANTILES = [50, 66, 75, 80, 90, 95, 98, 99, 100];

export const JTL_HEADERS = ['timeStamp', 'elapsed', 'label', 'responseCode', 'responseMessage', 'threadName', 'dataType', 'success', 'failureMessage', 'bytes', 'sentBytes', 'grpThreads', 'allThreads', 'URL', 'Latency', 'IdleTime', 'Connect'];
export const DEFAULT_OUTPUT = './output.csv';
export const outputConfig = {
    'Name': {
        transformRow: (acc, { label }) => {
            if (!acc[label]) acc[label] = {};

            return acc;
        }
    }, 'Method': {
        transformRow: (acc, { label }) => {
            const method = label.substring(0, label.indexOf(' '));
            if (!acc[label].Method) acc[label].Method = method;

            return acc;
        }
    }, 'Path': {
        transformRow: (acc, { label, URL }) => {
            if (!acc[label].Path) {
                const withoutProtocol = (URL.split('//'))[1];
                acc[label].Path = withoutProtocol.substring(withoutProtocol.indexOf('/'));
            }
        }
    }, '# requests': {
        transformRow: (acc, { label }) => {
            if (!acc[label].Requests) acc[label].Requests = 0;
            acc[label].Requests++;

            return acc;
        }
    }, '# failures': {
        transformRow: (acc, { label, success }) => {
            if (!acc[label].Errors) acc[label].Errors = 0;
            acc[label].Errors += success === 'true' ? 0 : 1;

            return acc;
        }
    }, '% failures': {
        transformRow: (acc, { label }) => {
            if (!acc[label]['Error %']) acc[label]['Error %'] = 0;
            acc[label]['Error %'] = parseFloat(((acc[label].Errors / acc[label].Requests) * 100).toFixed(2));

            return acc;
        }
    }, 'Median response time': {
        transformRow: (acc, { label, elapsed }) => {
            if (!acc[label]._times) acc[label]._times = [];
            acc[label]._times.push(parseInt(elapsed));

            return acc;
        },
        transformOutput: acc => {
            for (let label of Object.keys(acc)) {
                const { _times } = acc[label];
                // Sort the times in-place
                _times.sort((a, b) => a - b);
                acc[label].Median = _times[parseInt((_times.length + 1) / 2)];
            }

            return acc;
        }
    }, 'Average response time': {
        transformOutput: acc => {
            for (let label of Object.keys(acc)) {
                acc[label].Average = mean(acc[label]._times);
            }
            
            return acc;
        }
    }, 'Min response time': {
        transformRow: (acc, { label, elapsed }) => {
            acc[label].Min = (acc[label].Min === undefined ? elapsed : Math.min(acc[label].Min, elapsed));

            return acc;
        }
    }, 'Max response time': {
        transformRow: (acc, { label, elapsed }) => {
            acc[label].Max = (acc[label].Max === undefined ? elapsed : Math.max(acc[label].Max, elapsed));

            return acc;
        }
    }, 'Requests/s': {
        transformRow: (acc, { label, timeStamp }) => {
            if (!acc[label]._firstTS) acc[label]._firstTS = timeStamp;
            acc[label]._lastTS = timeStamp;

            return acc;
        },
        transformOutput: acc => {
            for (let label of Object.keys(acc)) {
                const { Requests, _firstTS, _lastTS } = acc[label];
                acc[label].RPS = parseFloat((Requests / ((_lastTS - _firstTS) / 1000)).toFixed(2));
            }

            return acc;
        }
    }, 'percentages': {
        transformOutput: acc => {
            for (let label of Object.keys(acc)) {
                const { _times } = acc[label];
                for (let percent of QUANTILES) {
                    acc[label][`${percent}%`] = parseFloat(quantile(_times, (percent / 100)).toFixed(2));
                }
            }

            return acc;
        }
    }
}