/*:
 * @plugindesc Set switches as important, check dependencies
 * @author DeadElf79
 *
 * @param Default importance of switches
 * @desc 1 = All switches are important, next list
 * make switches unimportant. 0 - only listed are important
 * @default 0
 *
 * @param Important Switches List
 * @desc Comma separated switch IDs
 * Example: 1,2,3-6,12-81,102
 * @default 1
 *
 * @param ---
 * @desc Separator
 *
 * @param Default importance of variables
 * @desc 1 = All vars are important, next list
 * make vars unimportant. 0 - only listed are important
 * @default 0
 *
 * @param Important Variables List
 * @desc Comma separated variable IDs
 * Example: 1,2,3-6,12-81,102
 * @default 1
 *
 * @param Max ID
 * @desc If used Default importance equal 1,
 * that number can reduce amount of important switches
 * @default 9999
 *
 * @param ---
 * @desc Separator
 *
 * @param All items are important?
 * @desc 0 - only listed
 * 1 - all include listed
 * @default 1
 *
 * @param Important Items List
 * @desc Comma separated item IDs
 * Example: 1,2,3-6,12-81,102
 * @default 1
 *
 * @param ---
 * @desc Separator
 *
 * @param All weapons are important?
 * @desc 0 - only listed
 * 1 - all include listed
 * @default 1
 *
 * @param Important Weapons List
 * @desc Comma separated weapon IDs
 * Example: 1,2,3-6,12-81,102
 * @default 1
 *
 * @param ---
 * @desc Separator
 *
 * @param All armors are important?
 * @desc 0 - only listed
 * 1 - all include listed
 * @default 1
 *
 * @param Important Armors List
 * @desc Comma separated armor IDs
 * Example: 1,2,3-6,12-81,102
 * @default 1
 */
 
/* SwitchAnalyzer module */
function SwitchAnalyzer() {
    throw new Error('This is a static class');
}

// copied from Galv's New Game Plus plugin
SwitchAnalyzer.sortNumber = function(a,b) {
    return a - b;
};

// copied from Galv's New Game Plus plugin
SwitchAnalyzer.makeList = function(string) {
	var list = string.split(",");
	var finalList = {'ids':[], 'ranges':[]};
	
	for (var i = 0; i < list.length; i++) {
		var number = Number(list[i]);
		if (isNaN(list[i])) {
			// create range
			var range = list[i].split("-");
			range = [Number(range[0]),Number(range[1])];
			range.sort(SwitchAnalyzer.sortNumber);
			finalList.ranges.push(range);
		} else {
			// Add number
			finalList.ids.push(number);
		};
	}
	return finalList;
}

/* Plugin Options */
SwitchAnalyzer.defaultImportanceOfSwitches 	= Number(PluginManager.parameters('SwitchAnalyzer')["Default importance of switches"] || 0);
SwitchAnalyzer.defaultImportanceOfVars 		= Number(PluginManager.parameters('SwitchAnalyzer')["Default importance of variables"] || 0);
SwitchAnalyzer.switchList 					= SwitchAnalyzer.makeList(PluginManager.parameters('SwitchAnalyzer')["Important Switches List"]);
SwitchAnalyzer.varList 						= SwitchAnalyzer.makeList(PluginManager.parameters('SwitchAnalyzer')["Important Variables List"]);
SwitchAnalyzer.maxId						= Number(PluginManager.parameters('SwitchAnalyzer')['Max ID'] || 9999)

/* internal */

SwitchAnalyzer._switches	= []; // important switches
SwitchAnalyzer._variables	= []; // important variables
SwitchAnalyzer._maps		= []; // map triggers
SwitchAnalyzer._members		= {}; // important party members (actor ids and conditions)
SwitchAnalyzer._items		= {}; // important items (ex: {'item_ids':[1,2,3],'weapon_ids':[4,5,6]}) // or {'items':{1:{'onSwitch':[1,2,3]}}}
SwitchAnalyzer._regions		= {}; // important regions
SwitchAnalyzer._events		= {}; // ...for future features like event pages or branches

/* public */

SwitchAnalyzer.load = function(){
	this._loadImportants();
	this._loadDependencies();
};

SwitchAnalyzer.isMapAvailable = function( var mapId ){
	if ( this.hasMapTriggers( mapId ) ){
		var triggers = this._mapTriggers( mapId );
		for( var index = 0 ; index < triggers.length; index++ ){
			if ($gameSwitches.value(triggers[index])==false){
				return false;
			}
		}
	}
	return true;
};

SwitchAnalyzer.hasMapTriggers = function( var mapId ){
	return this.mapTriggers.length>0;
}

/* private */

SwitchAnalyzer._loadImportants = function(){
	// TODO: try to show "Loading" screen, if loading request too much time
	// read about Promise
	
	this._loadSwitchesAndVariables();
	this._loadMapTriggers();
	this._loadMembers();
	this._loadItems();
	this._loadRegions();
	this._loadEvents();
};

SwitchAnalyzer._loadDependencies = function(){
	// TODO: add this using graphs and nodes
};

SwitchAnalyzer._mapTriggers = function( var mapId ){
	return SwitchAnalyzer._maps[ mapId ];
};

SwitchAnalyzer._loadSwitchesAndVariables = function(){
	// local vars
	var index;
	var importantRegEx = /IMPORTANT/i;
	// read system.json
	if ( $dataSystem == undefined ){
		DataManager.loadDataFile('$dataSystem','System.json');
	}
	
	// switches
	// ...by switch list
	if ( this.defaultImportanceOfSwitches > 0 ){
		for( index = 0; index <= this.maxId; index++ ){
			if ( this.switchList.ids.indexOf( index ) < 0 ) {
				this._switches = index;
			}
		}
	} else {
		this._switches = this.switchList.ids;
	};
	// ...by system.json
	for( index = 0; index <= this.maxId; index++ ){
		if ( $dataSystem.switches[ index ] == undefined ){
			break;
		}
		if ( this.defaultImportanceOfSwitches > 0 ){
			if ( $dataSystem.switches[ index ].test( importantRegEx ) ){
				if ( this._switches.indexOf( $dataSystem.switches[ index ] ) > -1 ){
					this._switches.push( $dataSystem.switches[ index ] );
				}
			}
		} else {
			if ( !$dataSystem.switches[ index ].test( importantRegEx ) ){
				if ( this._switches.indexOf( $dataSystem.switches[ index ] ) > -1 ){
					this._switches.push( $dataSystem.switches[ index ] );
				}
			}
		};
	}
	// variables
	// ...by var list
	if ( this.defaultImportanceOfSwitches > 0 ){
		for( index = 0; index <= this.maxId; index++ ){
			if ( this.varList.ids.indexOf( index ) < 0 ) {
				this._variables = index;
			}
		}
	} else {
		this._variables = this.varList.ids;
	};
	// ...by system.json
	for( index = 0; index <= this.maxId; index++ ){
		if ( $dataSystem.switches[ index ] == undefined ){
			break;
		}
		if ( this.defaultImportanceOfSwitches > 0 ){
			if ( $dataSystem.switches[ index ].test( importantRegEx ) ){
				if ( this._switches.indexOf( $dataSystem.switches[ index ] ) > -1 ){
					this._switches.push( $dataSystem.switches[ index ] );
				}
			}
		} else {
			if ( !$dataSystem.switches[ index ].test( importantRegEx ) ){
				if ( this._switches.indexOf( $dataSystem.switches[ index ] ) > -1 ){
					this._switches.push( $dataSystem.switches[ index ] );
				}
			}
		};
	}
};

SwitchAnalyzer._loadMapTriggers = function(){
	// maps
	for( mapIndex = 0; mapIndex < 999; mapIndex++ ){
		DataManager.loadMapData( index );
		if ( DataManager._errorUrl ){
			break;
		} else {
			// ..load from node
			var noteArray = $dataMap.note.split( "\n" );
			var checkRegEx = /<OnTriggers:[\s]*((?:\d+[,]?[\s]*)*)>/i;
			var note = '';
			for( index = 0; index < noteArray.length; index++ ){
				if ( noteArray[ index ].test( checkRegEx ) ){
					note = noteArray[ index ].exec( checkRegEx );
					break;
				}
			}
			// ..convert to array of int
			var triggers = note.split(",");
			var sorted = [], result = [];
			for(index = 0; index < triggers.length; index++ ){
				triggers[index] = parseInt(triggers[index].trim(),10);
			}
			// ..and exclude duplicates
			sorted = triggers.slice().sort();
			for (index = 0; index < arr.length - 1; index++) {
				if (sorted[index + 1] == sorted[ index ]) {
					result.push( sorted_arr[ index ] );
				}
			}
			this._maps[ mapIndex ] = result;
		};
	};
};

SwitchAnalyzer._loadMembers = function(){
	// TODO: add this
};

SwitchAnalyzer._loadItems = function(){
	// TODO: add this
};

SwitchAnalyzer._loadRegions = function(){
	// TODO: add this
};

SwitchAnalyzer._loadEvents = function(){
	// TODO: add this
};

/* SwitchAnalyzer User Interface */
function Scene_SwitchAnalyzer() {
    this.initialize.apply(this, arguments);
}

Scene_SwitchAnalyzer.prototype = Object.create(Scene_MenuBase.prototype);
Scene_SwitchAnalyzer.prototype.constructor = Scene_SwitchAnalyzer;

Scene_SwitchAnalyzer.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
	this.createUI();
};

Scene_SwitchAnalyzer.createUI = function(){
	this.setBackgroundOpacity(100);
	
	
	// TODO: do something here
	this.content = document.createElement('div');
	this.content.style.cssText = [
			'position:absolute',
			''
		].join("; ");
	document.body.appendChild( this.content );
	
};