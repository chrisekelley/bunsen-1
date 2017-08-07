///<reference path="../typings.d.ts"/>
///<reference path="../../node_modules/cordova-node-plugin/index.d.ts"/>
import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
// import {CordovaNodePlugin} from './CordovaNodePlugin';
// import CordovaNodePlugin = require('./CordovaNodePlugin');
// import {CordovaNodePlugin} from './CordovaNodePlugin';
// import {CordovaNodePlugin} from './CordovaNodePlugin';
// import {CordovaNodePlugin} from '../typings';
// import * as CordovaNodePlugin from 'cordova-node-module';
// import * as CordovaNodePlugin from './CordovaNodePlugin';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Bunsen';
  datUri = '';
  results: string[];
  serverUrl = 'http://localhost:8080/dat';

  ngOnInit() {
    document.addEventListener('deviceready', () => {
      console.log("deviceready");
      // console.log(cordova.file);

      // Gain access to the main user file system.
      // dataDirectory
      // cacheDirectory
      // externalRootDirectory
      // window.resolveLocalFileSystemURL(cordova.file.cacheDirectory , removeDir, onErrorLoadFs);

      startNodeServer();

      // Delete bunsen dir
      function removeDir(rootDirEntry) {
        console.log("removeDir for " + rootDirEntry);
        rootDirEntry.getDirectory('bunsen', { create: false }, function (entry) {
          entry.removeRecursively(function(){
            // The file has been removed succesfully
            console.log("Removed dir at " + entry.toURL());
            createDirs(rootDirEntry)
          },function(error){
            // Error deleting the file
            console.log("Error deleting dir at " + entry.toURL() + " Error: " + error);
            createDirs(rootDirEntry)
          })
        }, function(error) {
          console.log("Unable to get the directory: " + error);
          createDirs(rootDirEntry)
        })
      }
      // Create node_modules dir
      function createDirs(rootDirEntry) {
        rootDirEntry.getDirectory('bunsen', { create: true }, function (entry) {
          console.log("Created dir at " + entry.toURL());
          createCopyDir(entry, 'node_modules');
          // createCopyDir(entry, 'node_modules', false)
        })
      }

      // create/copy dirs from assets dir.
      function createCopyDir(rootDirEntry, dir) {
        var url = cordova.file.applicationDirectory+"www/assets/" + dir;
        console.log("url: " + url)
        window.resolveLocalFileSystemURL(url, function(entry) {
            entry.copyTo(rootDirEntry, null, function(rs) {
              console.log(JSON.stringify(rs)); //success
              createCopyNodeDir(entry, 'node');
            }, function(rs) {
                console.log("Error copying " + entry.toURL() + " to " + rootDirEntry.toURL() + ' result:'+JSON.stringify(rs));
                createCopyNodeDir(entry, 'node');
            }
              );
        }, function(rs) { console.log("Error in resolveLocalFileSystemURL result for " + dir + ": "+JSON.stringify(rs));} );
      }
      // create/copy dirs from assets dir.
      function createCopyNodeDir(rootDirEntry, dir) {
        var url = cordova.file.applicationDirectory+"www/assets/" + dir;
        console.log("url: " + url)
        window.resolveLocalFileSystemURL(url, function(entry) {
            entry.copyTo(rootDirEntry, null, function(rs) {
              console.log(JSON.stringify(rs)); //success
              console.log("Starting Node");
              startNodeServer();
            }, function(rs) {
                console.log("Error copying to " + dir + ' result:'+JSON.stringify(rs));
                console.log("Starting Node");
                startNodeServer();
            }
              );
        }, function(rs) { console.log("Error in resolveLocalFileSystemURL result for " + dir + ": "+JSON.stringify(rs));} );
      }

      function onErrorLoadFs(error) {
        console.log("Error loading filesystem "+ error.code);
      }

      function checkPerms(callback) {
        var permissions = cordova.plugins.permissions;
        // console.log("permissions: " + JSON.stringify(permissions));
        permissions.checkPermission(permissions.WRITE_EXTERNAL_STORAGE, checkPermissionCallback, null);

        function checkPermissionCallback(status) {
          console.log("checking perms");
          if (!status.hasPermission) {
            var errorCallback = function () {
              console.warn('Storage permission is not turned on');
            }
            permissions.requestPermission(
              permissions.READ_EXTERNAL_STORAGE,
              function (status) {
                if (!status.hasPermission) {
                  console.log("Does not have perms");
                  errorCallback();
                } else {
                  console.log("Has perms");
                  // continue with starting server
                  callback();
                }
              },
              errorCallback);
          } else {
            console.log("status.has Permission");
            callback();
          }
        }
      }

      function startNodeServer() {
        CordovaNodePlugin.startServer(function (result) {
          console.log('Result of starting Node: ' + result);
        }, function (err) {
          console.log(err);
        });
      }

    }, false);
  }

  // Inject HttpClient into your component or service.
  constructor(private http: HttpClient) {}
  update(datUri: string) {
    this.datUri = datUri;
    console.log('dat datUri: ' + this.datUri);
    const body = {uri: this.datUri};
    // Make the HTTP request:
    this.http.post(this.serverUrl, body ).subscribe(data => {
      // Read the result field from the JSON response.
      // this.results = data['results'];
      // console.log("results: " + this.results)
      console.log('data: ' + data);
    });
  }
}
