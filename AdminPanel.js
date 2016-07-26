/*:
 * @plugindesc Admin panel for RPG-Maker-MV-Server. REQUIRES EvilCatControls.js!
 * @author DeadElf79
 *
 * @param Open by button
 * @desc You may set any button from keyboard
 * @default F12
 */

/* Addition to PluginManager */
PluginManager.hasScript = function(name) {
	if (this._scripts.indexOf(name.toLowerCase()>=0)) {
		return true;
	}
	return false;
};

/* AdminPanel module */
var AdminPanel=EvilCat.AdminPanel=function AdminPanel(){
	EvilCat.Plugin.call(this);
	this.sceneClass=Scene_Export;
}
EvilCat.extend(AdminPanel, EvilCat.Plugin);
AdminPanel.extendType('Key');

// parameters
AdminPanel.openKey = AdminPanel.paramKey('Open by button', false) || EvilCat.KeyCode.parse('F12');

// internal
AdminPanel.version = "1.0";

// public
AdminPanel.open = function(){
	SceneManager.push( Scene_AdminPanel );
};

/* Scene_AdminPanel class */
function Scene_AdminPanel(){
	this.initialize.apply(this, arguments);
}

Scene_AdminPanel.prototype = Object.create(Scene_MenuBase.prototype);
Scene_AdminPanel.prototype.constructor = Scene_AdminPanel;

Scene_AdminPanel.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_AdminPanel.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createUI();
};

clickSwitchAnalyzer = function(){
  this.content.clear();
};

clickProjectAnalyzer = function(){
  
};

clickServerPreprocessor = function(){
  
};

Scene_AdminPanel.prototype.createUI = function(){
	this.setBackgroundOpacity(100);
	
	// ui based on deadelf79's design [http://jsbin.com/ribubev/edit?js,output]
	this.content = document.createElement('div');
	this.content.style.cssText = [
			'width:640px',
			'margin:0 auto',
      'background-color:#fff'
		].join("; ");
	this.div_title = document.createElement('div');
	this.div_title.style.cssText = [
      'width:618px',
      'border:3px solid #666',
      'border-bottom:1px dashed #666',
      'background-color: #fff',
      'padding:8px',
      'padding-bottom:0px'
		].join("; ");
  this.div_navigator = document.createElement('div');
	this.div_navigator.style.cssText = [
      'width:618px',
      'border:3px solid #666',
      'border-top:none',
      'background-color: #fff',
      'padding:8px',
      'padding-top:0px'
		].join("; ");
  
  // admin title
  this.name_span_div_title = document.createElement('span');
  this.name_span_div_title.innerHTML = '<b>RPG Maker MV Server</b> | Admin panel';
  this.version_span_div_title = document.createElement('span');
  this.version_span_div_title.innerHTML = '<b>v.' + AdminPanel.version + '</b>';
  this.version_span_div_title.style.cssText = [
    'background-color:#083',
    'padding-left:4px;',
    'padding-right:4px;',
    'color:#fff',
    'float:right'
  ].join("; ");
  this.table_navigator = document.createElement('table');
  this.table_navigator.style.cssText = [
    'border:1px solid #bbb',
    'border-top:none',
    'border-collapse: collapse',
    'width:100%'
  ].join("; ");
  
  // admin tab buttons
  var index;
  this.table_rows = [];
  this.tabs = [];
  var tab_names = [
    'Switch Analyzer',
    'Project Analyzer',
    'Server Preprocessor',
  ];
  var tab_funcs = [
    this._clickSwitchAnalyzer,
    this._clickProjectAnalyzer,
    this._clickServerPreprocessor,
  ];
  var tab_descs = [
    '<u><b>Switch Analyzer</b></u><br>Set game datas as important, check dependencies between switches, conditions and places of use actors, items, weapons, etc.',
    '<u><b>Project Analyzer</b></u><br>Show used/not used resource files (images, audio) and database sections (ex: actors, items, etc)',
    '<u><b>Server Preprocessor</b></u><br><b>Final step before uploading project to server.</b><br>'+
      'Cut all important common events, event branches or commands to <b>Logic Block</b> files. '+
      'Create a new directory that will contain project prepared for upload to the server.'
  ];
  for(index = 0; index < tab_names.length; index++){
    this.tabs[index] = document.createElement('input');
    this.tabs[index].type = 'button';
    this.tabs[index].value = tab_names[index];
    this.tabs[index].style.cssText = [
        'margin-right:4px',
        'cursor: pointer','cursor: hand',// browsers use different names
        'border:1px solid #666',
        'margin-bottom:none',
        'width:200px;'
      ].join("; ");
    this.tabs[index].addEventListener("click", tab_funcs[index], false);
    
    this.table_rows[index] = document.createElement('tr');
    var td1 = document.createElement('td');
    td1.style.cssText = [ 'width:100px' ].join("; ");
    td1.appendChild( this.tabs[index] );
    var td2 = document.createElement('td');
    td2.style.cssText = [ 'align:left', 'border:1px solid #ccc' ].join("; ");
    td2.innerHTML = tab_descs[index];
    
    this.table_rows[index].appendChild( td1 );
    this.table_rows[index].appendChild( td2 );
    this.table_navigator.appendChild( this.table_rows[index] );
  }
  
  this.div_title.appendChild( this.name_span_div_title );
  this.div_title.appendChild( this.version_span_div_title );
  this.div_navigator.appendChild( this.table_navigator );
	this.content.appendChild( this.div_title );
  this.content.appendChild( this.div_navigator );
	document.body.appendChild( this.content );
};

Scene_AdminPanel.prototype._clickSwitchAnalyzer = function(){
	if ( PluginManager.hasScript( 'SwitchAnalyzer' ) ){
		SceneManager.push(Scene_SwitchAnalyzer);
	} else {
		alert("SwitchAnalyzer plugin hasn't been installed!");
	}
};

Scene_AdminPanel.prototype._clickProjectAnalyzer = function(){
	if ( PluginManager.hasScript( 'ProjectAnalyzer' ) ){
		SceneManager.push(Scene_ProjectAnalyzer);
	} else {
		alert("ProjectAnalyzer plugin hasn't been installed!");
	}
};

Scene_AdminPanel.prototype._clickServerPreprocessor = function(){
	if ( PluginManager.hasScript( 'ServerPreprocessor' ) ){
		SceneManager.push(Scene_ServerPreprocessor);
	} else {
		alert("ServerPreprocessor plugin hasn't been installed!");
	}
};

var _SM_onKeyDown=SceneManager.onKeyDown;
SceneManager.onKeyDown = function(event)
{
	_SM_onKeyDown.apply(this, arguments);
	
	if (!event.ctrlKey && ! event.altKey && AdminPanel.openKey.recognize(event)) AdminPanel.open();
}