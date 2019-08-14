# JTL File Parser
[![Build Status](https://travis-ci.com/varevarao/jtl_parser.svg?branch=master)](https://travis-ci.com/varevarao/jtl_parser) ![GitHub package.json version](https://img.shields.io/github/package-json/v/varevarao/jtl_parser)

A quick and simple parser for JMeter outputted JTL files. This tool comes with a config file which can be customized to build your output.

## Setup
Clone the repository, and run `yarn install` to initialize

## Usage
To run the tool use:
```
$ yarn start -f <input file path> [-o <output file path>]
```
The tool will then use the config supplied under `src/config.js` to transform the input data into the output format, and write it to the output path (*which defaults to the project directory*)

## Config
The field `outputConfig` under `src/config.js` is the hook for data processing.
- Each key in that object is checked for containing a method named `transformRow`, or `transformOutput`, and the corresponding function is invoked
- If a key start with '**_**' it is *ignored*
- `transformRow` can be used to store/parse row level values, and is called with **two arguments**:
    - *accumulator*: This is a reference to the final object written to the output
    - *current row*: An object keyed by the corresponding `JTL_HEADERS`
- `transformOutput` can be used to add/update data based on the completed processing, and is called with a **single argument**:
    - *accumulator*: This is a reference to the final object written to the output