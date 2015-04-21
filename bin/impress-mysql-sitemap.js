#!/usr/bin/env node

'use strict';

var
  Application = require('../lib/Application'),
  yargs = require('yargs'),

  argv = yargs
    .usage('Usage: $0 [options]')
    .describe('server', 'Run sitemap generator server by default false')
    .describe('server-port', 'Sitemap generator server port by default 8697')
    .describe('storage-host', 'Database host by default localhost')
    .describe('storage-user', 'Database user by default root')
    .describe('storage-password', 'Database password by default empty')
    .describe('storage-database', 'Database name by default user default database')
    .describe('storage-tablename', 'Database impress table name by default impresses')
    .describe('config', 'Path to config file, can be multiple')
    .help('h')
    .alias('h', 'help')
    .epilog('impress-mysql-sitemap (https://github.com/icons8/impress-mysql-sitemap)')
    .argv;

new Application(argv).run();
