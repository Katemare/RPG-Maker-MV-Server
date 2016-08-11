/*:
 * @plugindesc Process project datas to get ready for server
 * @author DeadElf79
 *
 * @param Release Directory
 * @desc All processed files will be place here
 * @default /release/
 *
 * @param RPG Maker
 * @desc Name of the editor (for project file)
 * @default RPGMV
 *
 * @param RPG Maker Version
 * @desc Version of the editor (for project file)
 * @default 1.2.0
 */

/* ReleasePreprocessor module */
function ReleasePreprocessor() {
    throw new Error('This is a static class');
};

/* Plugin Options */
ReleasePreprocessor.releaseDirPath 	= String(PluginManager.parameters('ReleasePreprocessor')["Release Directory"] || "/release/");
ReleasePreprocessor.editorName 		= String(PluginManager.parameters('ReleasePreprocessor')["RPG Maker"] || "RPGMV");
ReleasePreprocessor.editorVersion 	= String(PluginManager.parameters('ReleasePreprocessor')["RPG Maker Version"] || "1.2.0");

/* internal */
ReleasePreprocessor._queue = [];
ReleasePreprocessor._ending = false;

/* public */
ReleasePreprocessor.start = function(){
	this._ending = false;
	this.createQueue();
	this.createReleaseDir();
	this.createProjectFiles();
	this.createProjectDirectories();
	this.createDatabase();
	this.createMaps();
	this.createScripts();
};

ReleasePreprocessor.createQueue = function() {
	this._queue = [];
};

ReleasePreprocessor.createReleaseDir = function() {
	var fs = require('fs');
	var path = this._localDirPath();
	var releaseDirPath = decodeURIComponent( path );
	this._mkdir( releaseDirPath );
};

ReleasePreprocessor.createProjectFiles = function() {
	var fs = require('fs');
	var data = this.editorName+" "+this.editorVersion;
	var filePath = this._localDirPath() + "Game.rpgproject"
    fs.writeFileSync(filePath, data);
};

ReleasePreprocessor.createProjectDirectories = function() {

};

ReleasePreprocessor.createDatabase = function() {

};

ReleasePreprocessor.createMaps = function() {

};

ReleasePreprocessor.createScripts = function() {

};

ReleasePreprocessor.isEnd = function() {
	return this._ending;
};

/* private */
ReleasePreprocessor._localDirPath = function() {
	return window.location.pathname.replace(/(\/www|)\/[^\/]*$/, this.releaseDirPath);
};

ReleasePreprocessor._mkdir = function(path) {
	var fs = require('fs');
	if ( !fs.existsSync( path ) ) {
        fs.mkdirSync( path );
    }
};

ReleasePreprocessor._push = function(some) {
	this._queue.push( some );
};
