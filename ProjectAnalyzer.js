/*:
 * @plugindesc Check used/unused files and database sections (like actors, items, etc)
 * @author DeadElf79
 *
 */

/* ProjectAnalyzer module */
function ProjectAnalyzer() {
    throw new Error('ProjectAnalyzer is a static class');
}

/* internal */
ProjectAnalyzer._actors;
ProjectAnalyzer._classes;
ProjectAnalyzer._skills;
ProjectAnalyzer._items;
ProjectAnalyzer._weapons;
ProjectAnalyzer._armors;
ProjectAnalyzer._enemies;
ProjectAnalyzer._troops;
ProjectAnalyzer._states;
ProjectAnalyzer._animations;
ProjectAnalyzer._tilesets;
ProjectAnalyzer._commonevents;
ProjectAnalyzer._system;
ProjectAnalyzer._mapinfos;
ProjectAnalyzer._mapData;
ProjectAnalyzer._tiles 		= {};
ProjectAnalyzer._results 	= {};

ProjectAnalyzer._databaseFiles = [
	{ name: 'ProjectAnalyzer._actors',       src: 'Actors.json'       },
    { name: 'ProjectAnalyzer._classes',      src: 'Classes.json'      },
    { name: 'ProjectAnalyzer._skills',       src: 'Skills.json'       },
    { name: 'ProjectAnalyzer._items',        src: 'Items.json'        },
    { name: 'ProjectAnalyzer._weapons',      src: 'Weapons.json'      },
    { name: 'ProjectAnalyzer._armors',       src: 'Armors.json'       },
    { name: 'ProjectAnalyzer._enemies',      src: 'Enemies.json'      },
    { name: 'ProjectAnalyzer._troops',       src: 'Troops.json'       },
    { name: 'ProjectAnalyzer._states',       src: 'States.json'       },
    { name: 'ProjectAnalyzer._animations',   src: 'Animations.json'   },
    { name: 'ProjectAnalyzer._tilesets',     src: 'Tilesets.json'     },
    { name: 'ProjectAnalyzer._commonevents', src: 'CommonEvents.json' },
    { name: 'ProjectAnalyzer._system',       src: 'System.json'       },
    { name: 'ProjectAnalyzer._mapinfos',     src: 'MapInfos.json'     }
];

/* public */
// Check all data files for used/unused
ProjectAnalyzer.check = function() {
	ProjectAnalyzer._loadData();
	ProjectAnalyzer._checkResources();
	ProjectAnalyzer._checkDB();
	ProjectAnalyzer._checkMaps();
};

// Return result of checking data/resource
// Start check, if it has no results
ProjectAnalyzer.results = function(){
	if ( this._results.length === 0 ) {
		this.check();
	}
	return this._results;
};

// --for advanced users only
// Check tileset for unused tiles and autotiles
ProjectAnalyzer.checkTilesets = function() {
	// TODO: add this
};
// --for advanced users only
// Remove unused tiles. Start checkTilesets
// if tileset doesn't checked before
// USE BEFORE RELEASE ONLY IF YOU DON'T WANT LOSE ANY 'FUTURE-USE' TILES
ProjectAnalyzer.removeUnusedTiles = function() {
	if ( this._tiles.length === 0 ) {
		this.checkTilesets();
	}
	// TODO: add more code
};

/* private */
ProjectAnalyzer._loadData = function() {
	var index;
	// database
	for ( index = 0; index < this._databaseFiles.length; index++ ) {
        var name = this._databaseFiles[i].name;
        var src = this._databaseFiles[i].src;
        this.loadDataFile(name, src);
    }
    // maps
    for ( index = 1; index < 999; index++ ){
    	DataManager.loadMapData( index );
		if ( DataManager._errorUrl ){
			break;
		} else {
			this._mapData[ index ] = $dataMap;
		}
    }
};

ProjectAnalyzer._checkResources = function() {
	// TODO: add this
};

ProjectAnalyzer._checkDB = function() {
	this._checkForActors();
	this._checkForClasses();
	this._checkForSkills();
	this._checkForItems();
	this._checkForWeapons();
	this._checkForArmors();
	this._checkForEnemies();
	this._checkForTroops();
	this._checkForStates();
	this._checkForAnimations();
	this._checkForTilesets();
	this._checkForCommonEvents();
	this._checkForSystem();
};

ProjectAnalyzer._checkForActors = function() {
	var used_actors_id = [];
	var index;

	var initial_party = this._system.partyMembers;
	var count_db_actors = this._actors.length - 1;

	// set initial party actors as used
	for ( index = 1; index < initial_party.length ; index++ ) {
		used_actors_id.push( initial_party[ index ].id );
	}

	// if there is still unused actors, then read all maps and commons
	if ( used_actors_id.length < count_db_actors ) {
		for ( var mapIndex = 1; mapIndex < this._mapData.length; mapIndex++ ){
			for ( var eventIndex = 1; eventIndex < this._mapData[ mapIndex ].events.length; eventIndex++ ){
				for ( var pageIndex = 0; pageIndex < this._mapData[ mapIndex ].events[ eventIndex ].pages.length; pageIndex++ ){
					for ( var listIndex = 0; listIndex < this._mapData[ mapIndex ].events[ eventIndex ].pages[ pageIndex ].list.length; listIndex++ ){
						var page = this._mapData[ mapIndex ].events[ eventIndex ].pages[ pageIndex ];
						var item = this._mapData[ mapIndex ].events[ eventIndex ].pages[ pageIndex ].list[ listIndex ];
						if ( item.code == 129 ){// change party members
							if ( item.parameters[ 1 ] == 0 ){// add actor to party
								if ( used_actors_id.indexOf( item.parameters[ 0 ] ) < 0 ){
									used_actors_id.push( item.parameters[ 0 ] );
								}
							}
						}
					}
				}
			}
		}
	}
	// if you still have unused then give it's ids...
	if ( used_actors_id.length < count_db_actors ) {
		this._results["allUsedActors"] = false;
		for ( index = 1; index < count_db_actors; index++ ) {
			if ( used_actors_id.indexOf( index ) < 0 ) {
				this._results["unusedActors"].push( index );
			}
		}
	} else {
	// or show success
		this._results["allUsedActors"] = true;
		this._results["unusedActors"] = [];	
	}
}

ProjectAnalyzer._checkForClasses = function() {

};
ProjectAnalyzer._checkForSkills = function() {

};
ProjectAnalyzer._checkForItems = function() {

};
ProjectAnalyzer._checkForWeapons = function() {

};
ProjectAnalyzer._checkForArmors = function() {

};
ProjectAnalyzer._checkForEnemies = function() {

};
ProjectAnalyzer._checkForTroops = function() {

};
ProjectAnalyzer._checkForStates = function() {

};
ProjectAnalyzer._checkForAnimations = function() {

};
ProjectAnalyzer._checkForTilesets = function() {

};
ProjectAnalyzer._checkForCommonEvents = function() {

};
ProjectAnalyzer._checkForSystem = function() {
	// check if initial party is empty
	// or starting position is not set
	if (this._system.partyMembers.length===0){
		this._results["emptyInitialParty"] = true;	
	} else {
		this._results["emptyInitialParty"] = false;
	}
	// check if weapon/armor types is unused
};

ProjectAnalyzer._checkMaps = function() {
	var used_maps = [];

	// push initial map
	used_maps.push( this._system.startMapId );

	// if player can transfer to map then it's used
	// (in future: add transferring to graph and show this to check
	// really used maps)
	for ( var mapIndex = 1; mapIndex < this._mapData.length; mapIndex++ ){
		for ( var eventIndex = 1; eventIndex < this._mapData[ mapIndex ].events.length; eventIndex++ ){
			for ( var pageIndex = 0; pageIndex < this._mapData[ mapIndex ].events[ eventIndex ].pages.length; pageIndex++ ){
				for ( var listIndex = 0; listIndex < this._mapData[ mapIndex ].events[ eventIndex ].pages[ pageIndex ].list.length; listIndex++ ){
					var page = this._mapData[ mapIndex ].events[ eventIndex ].pages[ pageIndex ];
					var item = this._mapData[ mapIndex ].events[ eventIndex ].pages[ pageIndex ].list[ listIndex ];
					if ( item.code == 201 ){// transfer player
						used_maps.push( item.parameters[ 1 ] );
					}
				}
			}
		}
	}

	// if you still have unused maps
	if ( this ) {
		this._results["allUsedMaps"] = false;
		for ( var mapIndex = 1; mapIndex < this._mapData.length; mapIndex++ ){
			if ( used_maps.indexOf( index ) < 0 ) {
				this._results["unusedMaps"].push( index );
			}
		}
	} else {
	// or show success
		this._results["allUsedMaps"] = true;
		this._results["unusedMaps"] = [];	
	}
};
