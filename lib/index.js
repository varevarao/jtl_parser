import csvReader from 'csv-parser';
import csvWriter from 'csv-write-stream';
import fs from 'fs';
import yargs from 'yargs';
import { DEFAULT_OUTPUT, JTL_HEADERS, outputConfig } from './config';

const CSV_OPTS_INPUT = {
    headers: JTL_HEADERS
};

const CSV_OPTS_OUTPUT = {
    sendHeaders: true
};

const outputObj = {};

const processRow = row => {
    const acc = outputObj;
    // For each key in the output map, which isn't ignored
    for (let key of Object.keys(outputConfig)) {
        if (key.startsWith('_')) {
            continue;
        }

        if ('transformRow' in outputConfig[key]) outputConfig[key].transformRow(acc, row);
    }
}

const processOutput = () => {
    const acc = outputObj;
    // For each key in the output map, which isn't ignored
    for (let key of Object.keys(outputConfig)) {
        if (key.startsWith('_')) {
            continue;
        }

        if ('transformOutput' in outputConfig[key]) outputConfig[key].transformOutput(acc);
    }

    if (isVerbose) console.log('Output', JSON.stringify(acc));

    // We're done, dump the output
    processComplete();
}

const processComplete = () => {
    console.log('Opening write stream to ', outputPath);
    const writer = csvWriter(CSV_OPTS_OUTPUT);

    writer.pipe(fs.createWriteStream(outputPath));
    for (let label of Object.keys(outputObj)) {
        // Clean up any ignored items
        const printable = { ...outputObj[label] };
        for (let key of Object.keys(outputObj[label])) {
            if (key.startsWith('_')) delete printable[key];
        }

        writer.write(printable);
    }

    writer.end();

    console.info('Done.');
}

const { f: filePath, o: outputPath = DEFAULT_OUTPUT, v: isVerbose = false } = yargs.argv;

try {
    fs.exists(filePath, proceed => {
        if (proceed) {
            console.info('Creating read stream for file at ', filePath);
            fs.createReadStream(filePath)
                .pipe(csvReader(CSV_OPTS_INPUT))
                .on('data', row => {
                    const { timeStamp } = row;
                    // If we're not on the header row, process
                    if (timeStamp !== JTL_HEADERS[0]) {
                        processRow(row);
                    }
                })
                .on('end', () => {
                    console.info('Completed parsing file.');
                    processOutput();
                });
        } else {
            console.error('No supported file found at path: ', filePath);
        }
    });
} catch (err) {
    console.error('Error while running program: ', err);
}