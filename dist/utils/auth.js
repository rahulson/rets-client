// Generated by CoffeeScript 1.12.7

/* jshint node:true */


/* jshint -W097 */

(function() {
  'use strict';
  var Promise, errors, headersHelper, login, logout, retsHttp, retsParsing;

  Promise = require('bluebird');

  retsParsing = require('./retsParsing');

  retsHttp = require('./retsHttp');

  headersHelper = require('./headers');

  errors = require('./errors');


  /*
   * Executes RETS login routine.
   */

  login = function(retsSession, client) {
    return retsHttp.callRetsMethod({
      retsMethod: 'login',
      queryOptions: {}
    }, retsSession, client).then(function(retsContext) {
      return new Promise(function(resolve, reject) {
        var gotData, headerCookie, headerCookies, i, len, matches, retsParser, systemData, typeIsArray;
        if (client.settings.userAgentPassword && retsContext.headerInfo.setCookie) {
          typeIsArray = Array.isArray || function(value) {
            return {}.toString.call(value) === '[object Array]';
          };
          if (typeIsArray(retsContext.headerInfo.setCookie)) {
            headerCookies = retsContext.headerInfo.setCookie;
          } else {
            headerCookies = [retsContext.headerInfo.setCookie];
          }
          for (i = 0, len = headerCookies.length; i < len; i++) {
            headerCookie = headerCookies[i];
            matches = headerCookie.match(/RETS\-Session\-ID=([^;]+);/);
            if (matches) {
              client.settings.sessionId = matches[1];
              break;
            }
          }
        }
        retsParser = retsParsing.getSimpleParser(retsContext, reject);
        systemData = {};
        gotData = false;
        retsParser.parser.on('text', function(text) {
          var j, keyVal, keyVals, len1, results, split;
          if (retsParser.currElementName !== 'RETS-RESPONSE') {
            return;
          }
          gotData = true;
          keyVals = text.split('\r\n');
          results = [];
          for (j = 0, len1 = keyVals.length; j < len1; j++) {
            keyVal = keyVals[j];
            split = keyVal.split('=');
            if (split.length > 1) {
              results.push(systemData[split[0].trim()] = split[1].trim());
            } else {
              results.push(void 0);
            }
          }
          return results;
        });
        retsParser.parser.on('endElement', function(name) {
          if (name !== 'RETS') {
            return;
          }
          retsParser.finish();
          if (!gotData) {
            return reject(new errors.RetsProcessingError(retsContext, 'Failed to parse data'));
          } else {
            return resolve({
              systemData: systemData,
              headerInfo: retsContext.headerInfo
            });
          }
        });
        retsParser.parser.write(retsContext.body);
        return retsParser.parser.end();
      });
    });
  };


  /*
   * Logouts RETS user
   */

  logout = function(retsSession, client) {
    return retsHttp.callRetsMethod({
      retsMethod: 'logout',
      queryOptions: {}
    }, retsSession, client).then(function(retsContext) {
      return {
        headerInfo: retsContext.headerInfo
      };
    });
  };

  module.exports = {
    login: login,
    logout: logout
  };

}).call(this);