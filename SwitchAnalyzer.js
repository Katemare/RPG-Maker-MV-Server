/*:
 * @plugindesc Set game datas as important, check dependencies
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
 * @param All actors are important?
 * @desc 0 - only IMPORTANT, 1 - all include listed,
 * 2 - only LOCAL
 * @default 0
 *
 * @param Important Actors List
 * @desc Comma separated actor IDs
 * Example: 1,2,3-6,12-81,102
 * @default 1
 *
 * @param ---
 * @desc Separator
 *
 * @param All items are important?
 * @desc 0 - only listed
 * 1 - all include listed
 * @default 0
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
 * @default 0
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
 * @default 0
 *
 * @param Important Armors List
 * @desc Comma separated armor IDs
 * Example: 1,2,3-6,12-81,102
 * @default 1
 *
 * @param ---
 * @desc Separator
 *
 * @param Important Regions List
 * @desc Comma separated region IDs
 * Example: 1,2,3-6,12-81,102
 * @default 200-255
 *
 * @help
 * TODO: convert this to condition object or something
 * SwitchAnalyzer._members[ index ] = [ Actor_ID, Condition ]
 * => Actor_ID - ID of actor from game database
 * => Condition = [ Condition_ID, Value_ID ]
 * 		=> Condition_ID - one from list:
 * 			* 0 - no condition ( member doesn't appear in a game )
 *			* 1 - initial party
 *			* 2 - appear ( add to party ) by a switch
 *			* 3 - appear by variable
 *			* 4 - appear by self-switch
 *			* 5 - appear by item ( if party has specified item )
 *			* 6 - appear by actor ( if specified actor is in party )
 *		=> Value_ID - id of something from database relatively to Condition_ID:
 *			* 0 - no matter
 *			* 1 - no matter
 *			* 2 - ID of switch
 *			* 3 - ID of variable
 *			* 4 - self-switch char ( 'A', 'B', 'C' or 'D' )
 *			* 5 - ID of item
 *			* 6 - ID of actor
 */

/* ConditionList class */
function ConditionList(){
	this.initialize.apply(this, arguments);
}

ConditionList.prototype = Object.create(Object.prototype);
ConditionList.prototype.constructor = ConditionList;

ConditionList.prototype.initialize = function(){
	this._data = [];
};

ConditionList.prototype.conditions = function(){
	return this._data;
};

ConditionList.prototype.length = function(){
	return this._data.length;
};

ConditionList.prototype.push = function( condition ){
	if ( condition instanceof Condition ){
		this._data.push( condition );
	} else {
		throw new Error('There must be Condition');
	}
}

ConditionList.prototype.clear = function(){
	this._data = [];
}

/* Condition class */
function Condition(){
	this.initialize.apply(this, arguments);
}

Condition.prototype = Object.create(Object.prototype);
Condition.prototype.constructor = Condition;

Condition.prototype.initialize = function( condition_id, value_id, condition_place ){
	this.condition_id 		= condition_id;
	this.value_id 			= value_id;
	this.condition_place 	= condition_place;
};

/* ConditionPlace class */
function ConditionPlace(){
	this.initialize.apply(this, arguments);
}

ConditionPlace.prototype = Object.create(Object.prototype);
ConditionPlace.prototype.constructor = ConditionPlace;

ConditionPlace.prototype.initialize = function( map_id, event_id, page_id, page_or_branch ){
	// TODO: need contain list id of command?
	this.map_id				= map_id;
	this.event_id			= event_id;
	this.page_id			= page_id;
	this.page_or_branch		= page_or_branch;
};
 
/* SwitchAnalyzer module */
function SwitchAnalyzer() {
    throw new Error('This is a static class');
};

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
SwitchAnalyzer.defaultImportanceOfSwitches 	= Number(PluginManager.parameters('SwitchAnalyzer')["Default importance of switches"] 	|| 0);
SwitchAnalyzer.defaultImportanceOfVars 		= Number(PluginManager.parameters('SwitchAnalyzer')["Default importance of variables"] 	|| 0);
SwitchAnalyzer.switchList 					= SwitchAnalyzer.makeList(PluginManager.parameters('SwitchAnalyzer')["Important Switches List"]);
SwitchAnalyzer.varList 						= SwitchAnalyzer.makeList(PluginManager.parameters('SwitchAnalyzer')["Important Variables List"]);
SwitchAnalyzer.maxId						= Number(PluginManager.parameters('SwitchAnalyzer')['Max ID'] || 9999);
//---
SwitchAnalyzer.defaultImportanceOfActors 	= Number(PluginManager.parameters('SwitchAnalyzer')["All actors are important?"] 	|| 0);
SwitchAnalyzer.defaultImportanceOfItems 	= Number(PluginManager.parameters('SwitchAnalyzer')["All items are important?"] 	|| 0);
SwitchAnalyzer.defaultImportanceOfWeapons 	= Number(PluginManager.parameters('SwitchAnalyzer')["All weapons are important?"] 	|| 0);
SwitchAnalyzer.defaultImportanceOfArmors 	= Number(PluginManager.parameters('SwitchAnalyzer')["All armors are important?"] 	|| 0);
//---
SwitchAnalyzer.actorsList 					= SwitchAnalyzer.makeList(PluginManager.parameters('SwitchAnalyzer')["Important Actors List"]);
SwitchAnalyzer.itemsList 					= SwitchAnalyzer.makeList(PluginManager.parameters('SwitchAnalyzer')["Important Items List"]);
SwitchAnalyzer.weaponsList 					= SwitchAnalyzer.makeList(PluginManager.parameters('SwitchAnalyzer')["Important Weapons List"]);
SwitchAnalyzer.armorsList 					= SwitchAnalyzer.makeList(PluginManager.parameters('SwitchAnalyzer')["Important Armors List"]);
//---
SwitchAnalyzer.regionsList 					= SwitchAnalyzer.makeList(PluginManager.parameters('SwitchAnalyzer')["Important Regions List"]);


/* interna database */
SwitchAnalyzer._mapData		= []; // map[ index ] data

/* internal */

SwitchAnalyzer._switches	= []; // important switches
SwitchAnalyzer._variables	= []; // important variables
SwitchAnalyzer._maps		= []; // map triggers
SwitchAnalyzer._members		= []; // important party members (actor ids and conditions)
SwitchAnalyzer._items		= {}; // important items (ex: {'item_ids':[1,2,3],'weapon_ids':[4,5,6]}) // or {'items':{1:{'onSwitch':[1,2,3]}}}
SwitchAnalyzer._regions		= {}; // important regions
SwitchAnalyzer._events		= {}; // ...for future features like event pages or branches
SwitchAnalyzer._golds		= []; // all changes of golds are important!

/* public */

SwitchAnalyzer.load = function(){
	this._resetData();
	this._loadImportants();
	this._loadDependencies();
	this._loaded = true;
};

SwitchAnalyzer.loaded = function(){
	return this._loaded;
}

SwitchAnalyzer.isMapAvailable = function( mapId ){
	if ( this.hasMapTriggers( mapId ) ){
		var triggers = this._mapTriggers( mapId );
		for( var index = 0 ; index < triggers.length; index++ ){
			if ( $gameSwitches.value( triggers[ index ] ) == false ){
				return false;
			}
		}
	}
	return true;
};

SwitchAnalyzer.hasMapTriggers = function( mapId ){
	return this.mapTriggers.length>0;
}

/* private */

SwitchAnalyzer._resetData = function(){
	SwitchAnalyzer._mapData		= [];
	SwitchAnalyzer._switches 	= [];
	SwitchAnalyzer._variables 	= [];
	SwitchAnalyzer._maps 		= [];
	SwitchAnalyzer._members.	= [];
	SwitchAnalyzer._items 		= {};
	SwitchAnalyzer._regions 	= {};
	SwitchAnalyzer._events 		= {};
	SwitchAnalyzer._golds		= [];
	this._loaded = false;
}

SwitchAnalyzer._loadImportants = function(){
	// TODO: try to show "Loading" screen, if loading request too much time
	// read about Promise
	this._loadMaps();
	this._loadSwitchesAndVariables();
	this._loadMapTriggers();
	this._loadMembers();
	this._loadItems();
	this._loadRegions();
	this._loadEvents();
	this._loadGolds();
};

SwitchAnalyzer._loadDependencies = function(){
	// TODO: add this using graphs and nodes
	this._membersDependencies();
};

SwitchAnalyzer._mapTriggers = function( mapId ){
	return SwitchAnalyzer._maps[ mapId ];
};

SwitchAnalyzer._loadMaps = function(){
	for( mapIndex = 1; mapIndex < 999; mapIndex++ ){
		DataManager.loadMapData( index );
		if ( DataManager._errorUrl ){
			break;
		} else {
			// ..add to internal variable
			this._mapData[ mapIndex ] = $dataMap;
		}
	}
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
				if ( this._switches.indexOf( index ) > -1 ){
					this._switches.push( index );
				}
			}
		} else {
			if ( !$dataSystem.switches[ index ].test( importantRegEx ) ){
				if ( this._switches.indexOf( index ) > -1 ){
					this._switches.push( index );
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
				if ( this._switches.indexOf( index ) > -1 ){
					this._switches.push( index );
				}
			}
		} else {
			if ( !$dataSystem.switches[ index ].test( importantRegEx ) ){
				if ( this._switches.indexOf( index ) > -1 ){
					this._switches.push( index );
				}
			}
		};
	}
};

SwitchAnalyzer._loadMapTriggers = function(){
	// maps
	for( mapIndex = 1; mapIndex < this._mapData.length; mapIndex++ ){
		// ..load from note
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
			triggers[index] = parseInt(triggers[ index ].trim(),10);
		}
		// ..and exclude duplicates
		sorted = triggers.slice().sort();
		for (index = 0; index < arr.length - 1; index++) {
			if (sorted[index + 1] == sorted[ index ]) {
				result.push( sorted_arr[ index ] );
			}
		}
		this._maps[ mapIndex ] = result;
	}
};

SwitchAnalyzer._loadMembers = function(){
	// local vars
	var index,note;
	var importantRegEx = /IMPORTANT/i;
	var localRegEx = /LOCAL/i;

	// read actors.json
	if ( $dataActors == undefined ){
		DataManager.loadDataFile('$dataActors','Actors.json');
	}
	// actors
	// ...by actors list
	// ONLY IMPORTANTS
	if ( this.defaultImportanceOfActors === 0 ){
		for ( index = 0; index < actorsList.length; index++ ){
			this._members.push( [ index, new ConditionList() ] );
		}
	}
	// ...by actors.json
	for ( index = 1; index < $dataActors.length; index++ ){
		switch ( this.defaultImportanceOfActors ){
			case 0:// ONLY IMPORTANTS
				note = $dataActors[ index ].note.split( "\n" );
				for ( var indexNote = 0; indexNote < note.length; indexNote++){
					if ( this._members.indexOf( index ) < 0 ){
						if ( note[ indexNote ].test( importantRegEx ) ){
							this._members.push( [ index, new ConditionList() ] );
						}
					}
				}
				break;
			case 2:// ONLY LOCALS
				note = $dataActors[ index ].note.split( "\n" );
				for ( var indexNote = 0; indexNote < note.length; indexNote++){
					if ( note[ indexNote ].test( localRegEx ) ){
						this._members.push( [ index, new ConditionList() ] );
					}
				}
				break;
			case 1://EVERYONE
				this._members.push( [ index, new ConditionList() ] );
		}
	}
};

SwitchAnalyzer._loadItems = function(){
	this._loadItemsOnly();
	this._loadWeaponsOnly();
	this._loadArmorsOnly();
}

SwitchAnalyzer._loadItemsOnly = function(){}
	// local vars
	var index,note;
	var importantRegEx = /IMPORTANT/i;
	var localRegEx = /LOCAL/i;

	// internal
	this._items['items'] = [];

	// read items.json
	if ( $dataItems == undefined ){
		DataManager.loadDataFile('$dataItems','Items.json');
	}
	// items
	// ...by items list
	// ONLY IMPORTANTS
	if ( this.defaultImportanceOfItems === 0 ){
		for ( index = 0; index < itemsList.length; index++ ){
			this._items['items'].push( [ index, new ConditionList() ] );
		}
	}
	// ...by items.json
	for ( index = 1; index < $dataItems.length; index++ ){
		switch ( this.defaultImportanceOfItems ){
			case 0:// ONLY IMPORTANTS
				note = $dataItems[ index ].note.split( "\n" );
				for ( var indexNote = 0; indexNote < note.length; indexNote++){
					if ( this._items.indexOf( index ) < 0 ){
						if ( note[ indexNote ].test( importantRegEx ) ){
							this._items['items'].push( [ index, new ConditionList() ] );
						}
					}
				}
				break;
			case 2:// ONLY LOCALS
				note = $dataItems[ index ].note.split( "\n" );
				for ( var indexNote = 0; indexNote < note.length; indexNote++){
					if ( note[ indexNote ].test( localRegEx ) ){
						this._items['items'].push( [ index, new ConditionList() ] );
					}
				}
				break;
			case 1://EVERYONE
				this._items['items'].push( [ index, new ConditionList() ] );
		}
	}
};

SwitchAnalyzer._loadWeaponsOnly = function(){}
	// local vars
	var index,note;
	var importantRegEx = /IMPORTANT/i;
	var localRegEx = /LOCAL/i;

	// internal
	this._items['weapons'] = [];

	// read weapons.json
	if ( $dataWeapons == undefined ){
		DataManager.loadDataFile('$dataWeapons','Weapons.json');
	}
	// weapons
	// ...by weapons list
	// ONLY IMPORTANTS
	if ( this.defaultImportanceOfWeapons === 0 ){
		for ( index = 0; index < weaponsList.length; index++ ){
			this._items['weapons'].push( [ index, new ConditionList() ] );
		}
	}
	// ...by weapons.json
	for ( index = 1; index < $dataWeapons.length; index++ ){
		switch ( this.defaultImportanceOfItems ){
			case 0:// ONLY IMPORTANTS
				note = $dataWeapons[ index ].note.split( "\n" );
				for ( var indexNote = 0; indexNote < note.length; indexNote++){
					if ( this._items.indexOf( index ) < 0 ){
						if ( note[ indexNote ].test( importantRegEx ) ){
							this._items['weapons'].push( [ index, new ConditionList() ] );
						}
					}
				}
				break;
			case 2:// ONLY LOCALS
				note = $dataWeapons[ index ].note.split( "\n" );
				for ( var indexNote = 0; indexNote < note.length; indexNote++){
					if ( note[ indexNote ].test( localRegEx ) ){
						this._items['weapons'].push( [ index, new ConditionList() ] );
					}
				}
				break;
			case 1://EVERYONE
				this._items['weapons'].push( [ index, new ConditionList() ] );
		}
	}
};

SwitchAnalyzer._loadArmorsOnly = function(){}
	// local vars
	var index,note;
	var importantRegEx = /IMPORTANT/i;
	var localRegEx = /LOCAL/i;

	// internal
	this._items['armors'] = [];

	// read armors.json
	if ( $dataArmors == undefined ){
		DataManager.loadDataFile('$dataArmors','Armors.json');
	}
	// armors
	// ...by armors list
	// ONLY IMPORTANTS
	if ( this.defaultImportanceOfArmors === 0 ){
		for ( index = 0; index < armorsList.length; index++ ){
			this._items['armors'].push( [ index, new ConditionList() ] );
		}
	}
	// ...by armors.json
	for ( index = 1; index < $dataArmors.length; index++ ){
		switch ( this.defaultImportanceOfItems ){
			case 0:// ONLY IMPORTANTS
				note = $dataArmors[ index ].note.split( "\n" );
				for ( var indexNote = 0; indexNote < note.length; indexNote++){
					if ( this._items.indexOf( index ) < 0 ){
						if ( note[ indexNote ].test( importantRegEx ) ){
							this._items['armors'].push( [ index, new ConditionList() ] );
						}
					}
				}
				break;
			case 2:// ONLY LOCALS
				note = $dataArmors[ index ].note.split( "\n" );
				for ( var indexNote = 0; indexNote < note.length; indexNote++){
					if ( note[ indexNote ].test( localRegEx ) ){
						this._items['armors'].push( [ index, new ConditionList() ] );
					}
				}
				break;
			case 1://EVERYONE
				this._items['armors'].push( [ index, new ConditionList() ] );
		}
	}
};

SwitchAnalyzer._loadRegions = function(){
	// TODO: add this
};

SwitchAnalyzer._loadEvents = function(){
	// TODO: add this
};

SwitchAnalyzer._loadGolds = function(){
	// TODO: add this
}

SwitchAnalyzer._membersDependencies = function(){
	// from initial party
	if ( $dataSystem == undefined ){
		DataManager.loadDataFile('$dataSystem','System.json');
	}

	var initial_party = this._system.partyMembers;
	var used_actors_id = [];

	for ( index = 1; index < initial_party.length ; index++ ) {
		used_actors_id.push( initial_party[ index ].id );
	}

	for ( var index = 0; index < this._members.length; index++ ){
		if ( used_actors_id.indexOf( this._members[ index ][ 0 ] ) >= 0 ){
			this._members[ index ][ 1 ].push( new Condition( 1, 0 ) );
		}
	}

	var branch = "page";
	var branches = [];

	// from mapData
	for( var mapIndex = 1; mapIndex < this._mapData.length; mapIndex++ ){
		if ( this._mapData[ mapIndex ].events.length > 1 ){
			for ( var eventIndex = 1; eventIndex < this._mapData[ mapIndex ].events.length; eventIndex++ ){
				for ( var pageIndex = 0; pageIndex < this._mapData[ mapIndex ].events[ eventIndex ].pages.length; pageIndex++ ){
					for ( var listIndex = 0; listIndex < this._mapData[ mapIndex ].events[ eventIndex ].pages[ pageIndex ].list.length; listIndex++ ){
						var page = this._mapData[ mapIndex ].events[ eventIndex ].pages[ pageIndex ];
						var item = this._mapData[ mapIndex ].events[ eventIndex ].pages[ pageIndex ].list[ listIndex ];
						
						// add actor by branch conditions
						if ( item.code == 111 ) { //...branch "if"
							branches.push(1);
							branch = "branch";
						}
						if ( item.code == 411 ) { //...branch "else"
							branch = "branch";
						}
						if ( item.code == 412 ) { //...branch "endif"
							branches.pop();
							if ( branches.length > 0 ){
								branch = "branch";
							} else {
								branch = "page";
							}
						}

						// add actor by page conditions
						if ( item.code == 129 ){// change party members
							if ( item.parameters[ 1 ] == 0 ){// add actor to party
								if ( this._members.indexOf( item.parameters[ 0 ] ) >= 0 ){// actor is in list
									var memberConditionList = this._members[ this._members.indexOf( item.parameters[ 0 ] ) ][ 1 ];
									// add by page switch
									if ( page.conditions.switch1Valid ){
										memberConditionList.push( new Condition( 2, item.conditions.switch1Id, new ConditionPlace( mapIndex, eventIndex, pageIndex, branch ) ) );
									}
									if ( page.conditions.switch2Valid ){
										memberConditionList.push( new Condition( 2, item.conditions.switch2Id, new ConditionPlace( mapIndex, eventIndex, pageIndex, branch ) ) );
									}
									// add by page variable
									if ( page.conditions.variableValid ){
										memberConditionList.push( new Condition( 3, item.conditions.variableId, new ConditionPlace( mapIndex, eventIndex, pageIndex, branch ) ) );
									}
									// add by page self-switch
									if ( page.conditions.selfSwitchValid ){
										memberConditionList.push( new Condition( 4, item.conditions.selfSwitchCh, new ConditionPlace( mapIndex, eventIndex, pageIndex, branch ) ) );
									}
									// add by page item
									if ( page.conditions.itemValid ){
										memberConditionList.push( new Condition( 5, item.conditions.itemId, new ConditionPlace( mapIndex, eventIndex, pageIndex, branch ) ) );
									}
									// add by page actor
									if ( page.conditions.actorValid ){
										memberConditionList.push( new Condition( 6, item.conditions.actorId, new ConditionPlace( mapIndex, eventIndex, pageIndex, branch ) ) );
									}
								}
							}
						}
					}
				}
			}
		}
	}
}

/* SwitchAnalyzer User Interface */
function Scene_SwitchAnalyzer() {
    this.initialize.apply(this, arguments);
}

Scene_SwitchAnalyzer.prototype = Object.create(Scene_MenuBase.prototype);
Scene_SwitchAnalyzer.prototype.constructor = Scene_SwitchAnalyzer;

Scene_SwitchAnalyzer.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_SwitchAnalyzer.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    if ( !SwitchAnalyzer.loaded ){
    	SwitchAnalyzer.load();
    }
    this.createUI();
}

Scene_SwitchAnalyzer.prototype.createUI = function(){
	this.setBackgroundOpacity(100);
	
	// ui based on deadelf79's design [http://jsbin.com/kayuti/edit?html,js,output]
	this.content = document.createElement('div');
	this.content.style.cssText = [
		'width:640px',
		'margin:0 auto',
		'background-color:#fff',
		'display:block',
		'z-index:999',
		'position:relative'
	].join("; ");
	this.div_navigator = document.createElement('div');
	this.div_navigator.style.cssText = [
		'width:618px',
		'border:3px solid #666',
		'border-bottom:1px dashed #666',
		'background-color: #fff',
		'padding:8px',
		'padding-bottom:0px'
	].join("; ");
	this.div_table = document.createElement('div');
	this.div_table.style.cssText = [
		'width:618px',
		'min-height:400px',
		'border:3px solid #666',
		'border-top:none',
		'border-bottom:none',
		'background-color: #fff',
		'padding:8px',
		'overflow-y:scroll'
	].join("; ");
	this.div_system = document.createElement('div');
	this.div_system.style.cssText = [
		'width:618px',
		'border:3px solid #666',
		'border-top:1px dashed #666',
		'background-color: #fff',
		'padding:8px',
		'padding-top:0'
	].join("; ");

	// database tab buttons
	var index;
	this.tabs = [];
	var tab_names = [
		'Switches',
		'Variables',
		'MapTriggers',
		'Members',
		'Items',
		'Regions',
		'EventPages'
	];
	var tab_funcs = [
		this._clickSwitches,
		this._clickVariables,
		this._clickMapTriggers,
		this._clickMembers,
		this._clickItems,
		this._clickRegions,
		this._clickEventPages
	];
	for(var index=0; index < tab_names.length; index++){
		this.tabs[index] = document.createElement('input');
		this.tabs[index].type = 'button';
		this.tabs[index].value = tab_names[index];
		this.tabs[index].style.cssText = [
			'margin-right:4px',
			'cursor: pointer','cursor: hand',// browsers use different names
			'border:1px solid #666'
		].join("; ");
		this.tabs[index].addEventListener("click", tab_funcs[index], false);
		this.div_navigator.appendChild( this.tabs[index] );
	}

	// system buttons
	this.systems = [];
	var system_names = [
		'Export result',
		'Show/Hide dependencies'
	];
	for(index = 0; index < system_names.length; index++){
		this.tabs[index] = document.createElement('input');
		this.tabs[index].type = 'button';
		this.tabs[index].value = system_names[index];
		this.tabs[index].style.cssText = [
			'margin-right:4px',
			'cursor: pointer','cursor: hand',// browsers use different names
			'border:1px solid #666',
			'border-top:none;',
			'margin-top:none'
		].join("; ");
		//this.tabs[index].addEventListener("click", tab_funcs[index], false);
		this.div_system.appendChild( this.tabs[index] );
	}

	this.content.appendChild( this.div_navigator );
	this.content.appendChild( this.div_table );
	this.content.appendChild( this.div_system );
	document.body.appendChild( this.content );

	console.log(this.content);
};

Scene_SwitchAnalyzer.prototype._clickSwitches = function(){
	//remove previous table
	if (this.table != undefined){
		this.content.removeChild( this.table );
	}

	// load analyzer
	if ( !SwitchAnalyzer.loaded ){
		SwitchAnalyzer.load();
	}

	// read system.json
	if ( $dataSystem == undefined ){
		DataManager.loadDataFile('$dataSystem','System.json');
	}

	this.table = document.createElement( 'table' );

	var trs = [];
	// head
	trs[ 0 ] = document.createElement( 'tr' );
	trs[ 0 ].innerHTML = [
		'<td>',
		'Total count\nof important switches',
		'</td>',
		'<td>',
		SwitchAnalyzer._switches.length,
		'</td>'
	].join();
	trs[ 1 ] = document.createElement( 'tr' );
	trs[ 1 ].innerHTML = '<td>Switch ID</td><td>Value</td>';
	this.table.appendChild( trs[ 0 ] );
	this.table.appendChild( trs[ 1 ] );

	// generate lines
	for( var index = 0; index < SwitchAnalyzer._switches.length; index++ ){
		trs[ index + 2 ] = document.createElement( 'tr' );
		trs[ index + 2 ].innerHTML = [
			'<td>',
			SwitchAnalyzer._switches[ index ],
			' : ',
			$dataSystem.switches[ index ],
			'</td>',
			'<td>',
			$gameSwitches.value( index ),
			'</td>'
		].join();
		this.table.appendChild( trs[ index + 2 ] );
	}

	this.div_table.appendChild( this.table );
	console.log( this.table );
};

Scene_SwitchAnalyzer.prototype._clickVariables = function(){
	//remove previous table
	if (this.table != undefined){
		this.content.removeChild( this.table );
	}

	// load analyzer
	if ( !SwitchAnalyzer.loaded ){
		SwitchAnalyzer.load();
	}

	// read system.json
	if ( $dataSystem == undefined ){
		DataManager.loadDataFile('$dataSystem','System.json');
	}

	this.table = document.createElement( 'table' );

	var trs = [];
	// head
	trs[ 0 ] = document.createElement( 'tr' );
	trs[ 0 ].innerHTML = [
		'<td>',
		'Total count\nof important variables',
		'</td>',
		'<td>',
		SwitchAnalyzer._variables.length,
		'</td>'
	].join();
	trs[ 1 ] = document.createElement( 'tr' );
	trs[ 1 ].innerHTML = '<td>Switch ID</td><td>Value</td>';
	this.table.appendChild( trs[ 0 ] );
	this.table.appendChild( trs[ 1 ] );

	// generate lines
	for( var index = 0; index < SwitchAnalyzer._variables.length; index++ ){
		trs[ index + 2 ] = document.createElement( 'tr' );
		trs[ index + 2 ].innerHTML = [
			'<td>',
			SwitchAnalyzer._variables[ index ],
			' : ',
			$dataSystem.variables[ index ],
			'</td>',
			'<td>',
			$gameVariables.value( index ),
			'</td>'
		].join();
		this.table.appendChild( trs[ index + 2 ] );
	}

	this.div_table.appendChild( this.table );
};

Scene_SwitchAnalyzer.prototype._clickMapTriggers = function(){
  
};

Scene_SwitchAnalyzer.prototype._clickMembers = function(){
  
};

Scene_SwitchAnalyzer.prototype._clickItems = function(){
  
};

Scene_SwitchAnalyzer.prototype._clickRegions = function(){
  
};

Scene_SwitchAnalyzer.prototype._clickEventPages = function(){
  
};
