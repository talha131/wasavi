// ==UserScript==
// @include http://wasavi.appsweets.net/
// @include https://ss1.xrea.com/wasavi.appsweets.net/
// ==/UserScript==
//
/**
 * wasavi: vi clone implemented in javascript
 * =============================================================================
 *
 *
 * @author akahuku@gmail.com
 * @version $Id: wasavi.js 287 2013-01-22 14:01:12Z akahuku $
 */
/**
 * Copyright 2012 akahuku, akahuku@gmail.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

(function (global) {

/*
 * classes {{{1
 * ----------------
 */

/*constructor*/function AppProxy () {
	var low = {
		get getLocalStorage () {return getLocalStorage},
		get setLocalStorage () {return setLocalStorage},
		get isEditing () {return isEditing},
		get pushInputMode () {return pushInputMode},
		get popInputMode () {return popInputMode},
		get showPrefixInput () {return showPrefixInput},
		get showMessage () {return showMessage},
		get requestShowMessage () {return requestShowMessage},
		get requestRegisterNotice () {return requestRegisterNotice},
		get requestInputMode () {return requestInputMode},
		get executeExCommand () {return executeExCommand},
		get executeViCommand () {return executeViCommand},
		get processInput () {return processInput},
		get processInputSupplement () {return processInputSupplement},
		get getFindRegex () {return getFindRegex},
		get getFileIoResultInfo () {return getFileIoResultInfo},
		get getFileInfo () {return getFileInfo},
		get fireEvent () {return fireEvent},
		get fireNotifyKeydownEvent () {return fireNotifyKeydownEvent},
		get fireCommandCompleteEvent () {return fireCommandCompleteEvent},
		get setSubstituteWorker () {return setSubstituteWorker}
	};
	var motion = {
		get left () {return motionLeft},
		get right () {return motionRight},
		get lineStart () {return motionLineStart},
		get lineEnd () {return motionLineEnd},
		get lineStartDenotative () {return motionLineStartDenotative},
		get lineEndDenotative () {return motionLineEndDenotative},
		get nextWord () {return motionNextWord},
		get prevWord () {return motionPrevWord},
		get findForward () {return motionFindForward},
		get findBackward () {return motionFindBackward},
		get findByRegexFacade () {return motionFindByRegexFacade},
		get findByRegexForward () {return motionFindByRegexForward},
		get findByRegexBackward () {return motionFindByRegexBackward},
		get replaceOne () {return motionReplaceOne},
		get upDown () {return motionUpDown},
		get up () {return motionUp},
		get down () {return motionDown},
		get upDownDenotative () {return motionUpDownDenotative}
	};
	var edit = {
		get deleteSelection () {return deleteSelection},
		get insert () {return insert},
		get overwrite () {return overwrite},
		get shift () {return shift},
		get unshift () {return unshift},
		get joinLines () {return joinLines},
		get yank () {return yank},
		get paste () {return paste}
	};
	return {
		get extensionChannel () {return extensionChannel},
		get quickActivation () {return quickActivation},
		get devMode () {return devMode},
		get fstab () {return fstab},
		get abbrevs () {return abbrevs},
		get keyManager () {return keyManager},
		get mapManager () {return mapManager},
		get theme () {return theme},
		get config () {return config},
		get version () {return version},

		get registers () {return registers},

		get targetElement () {return targetElement},
		get buffer () {return buffer},
		get fileName () {return fileName},
		set fileName (v) {fileName = v},
		get preferredNewline () {return preferredNewline},
		set preferredNewline (v) {preferredNewline = v},
		get terminated () {return terminated},
		set terminated (v) {terminated = v},
		get writeOnTermination () {return writeOnTermination},
		set writeOnTermination (v) {writeOnTermination = v},
		get state () {return state},
		get runLevel () {return runLevel},
		get marks () {return marks},
		get cursor () {return cursor},
		get scroller () {return scroller},
		get editLogger () {return editLogger},
		get prefixInput () {return prefixInput},
		get inputMode () {return inputMode},
		get requestedState () {return requestedState},
		get charWidth () {return charWidth},
		get lineHeight () {return lineHeight},
		get backlog () {return backlog},
		get exCommandExecutor () {return exCommandExecutor},
		get recordedStrokes () {return recordedStrokes},

		get isTextDirty () {return config.vars.modified},
		set isTextDirty (v) {config.setData(v ? 'modified' : 'nomodified')},
		get isEditCompleted () {return isEditCompleted},
		set isEditCompleted (v) {isEditCompleted = v},
		get isVerticalMotion () {return isVerticalMotion},
		set isVerticalMotion (v) {isVerticalMotion = v},
		get isInteractive () {return isInteractive},
		set isInteractive (v) {isInteractive = v},
		get isJumpBaseUpdateRequested () {return isJumpBaseUpdateRequested},
		set isJumpBaseUpdateRequested (v) {isJumpBaseUpdateRequested = v},

		get lastSimpleCommand () {return lastSimpleCommand},
		get lastRegexFindCommand () {return lastRegexFindCommand},
		get lastSubstituteInfo () {return lastSubstituteInfo},
		get lastMessage () {return lastMessage},
		set lastMessage (v) {lastMessage = v},

		/*
		 * low level methods
		 */
		get low () {return low},

		/*
		 * motions
		 */
		get motion () {return motion},

		/*
		 * edit operations
		 */
		get edit () {return edit},

		/*
		 * methods
		 */
		dataset: function (key, value) {
			return arguments.length >= 2 ?
				dataset(targetElement, key, value) :
				dataset(targetElement, key);
		}
	};
}

/*constructor*/function Collection () {
}
Collection.prototype = Object.create({}, {
	clear: {
		value: function () {
			Object.keys(this).forEach(function (key) {
				delete this[key];
			}, this);
		}
	},
	size: {
		value: function () {
			return Object.keys(this).length;
		}
	}
});

/*constructor*/function ExCommandExecutor (isRoot, onFinish) {
	this.commands = [];
	this.editLogLevel = 0;
	this.isRoot = !!isRoot;
	this.isAsync = false;
	this.sGlobalSpecified = false;
	this.source = '';
	this.onFinish = onFinish || null;
	this.lastError = undefined;
	this.lastCommand = undefined;

	var running = false;
	this.__defineGetter__('running', function () {return running;});
	this.__defineSetter__('running', function (v) {
		if (v == running) return;
		running = v;
		$('wasavi_cover').className = v ? 'dim' : '';
	});
}
ExCommandExecutor.prototype = {
	_runCore: function (command, args) {
		var ss = buffer.selectionStart;
		var result = command.run(appProxy, args);
		if (typeof result == 'string') {
			this.lastError = result || _('{0}: unknown error.', command.name);
			return false;
		}
		if ((isJumpBaseUpdateRequested || command.flags.updateJump)
		&& buffer.selectionStart.ne(ss)) {
			marks.setJumpBaseMark(ss);
			isJumpBaseUpdateRequested = false;
		}
		if (result.flags.hash || result.flags.list || result.flags.print) {
			var n = Math.max(0, Math.min(
				buffer.selectionStartRow + result.flagoff, t.rowLength - 1));
			buffer.setSelectionRange(buffer.getLineTopOffset2(n, 0));
			ExCommand.printRow(appProxy, buffer, n.row, n.row, result.flags);
		}
		this.lastError = undefined;
		return true;
	},
	_runAsyncWrapper: function () {
		var tc;
		try {
			if (this.commands.length) {
				this.lastCommand = tc = this.commands.shift();
				if (tc[0].flags.multiAsync && !this.isAsync) {
					this.lastError = _('{0}: Executed in synchronous context.', tc[0].name);
					this.commands.length = 0;
					this.lastCommand = tc = undefined;
				}
				else if (!this._runCore(tc[0], tc[1])) {
					this.commands.length = 0;
					this.lastCommand = tc = undefined;
				}
			}
		}
		finally {
			if (!tc || !tc[0] || !tc[0].flags.multiAsync) {
				this.runAsyncNext();
			}
		}
	},
	_isClipboardAccess: function (args) {
		return extensionChannel && args.flags.register && args.register == '*';
	},
	clear: function () {
		this.commands.length = 0;
		this.lastCommand = undefined;
		this.isAsync = false;
	},
	stop: function () {
		this.commands.length = 0;
		this.lastCommand = undefined;
		this.runAsyncNext();
	},
	add: function (ex, args) {
		this.commands.push([ex, args]);
		this.isAsync = this.isAsync || this._isClipboardAccess(args) || ex.flags.multiAsync;
	},
	runAsyncNext: function (injectExCommand, arg) {
		if (!this.isAsync) return;

		injectExCommand && arg && this.commands.unshift([injectExCommand, arg]);

		if (this.commands.length) {
			setTimeout((function (obj, fn, cmd) {return function () {
				if (obj._isClipboardAccess(cmd[1])) {
					extensionChannel.getClipboard(function () {fn.call(obj);});
				}
				else {
					fn.call(obj);
				}
			}})(this, this._runAsyncWrapper, this.commands[0]), 0);
		}
		else {
			if (this.editLogLevel > 0) {
				editLogger.close();
				this.running = false;
				this.editLogLevel--;
			}
			this.onFinish && this.onFinish(this);
			var e = document.createEvent('UIEvent');
			e.initUIEvent('wasavi_command', false, true, document.defaultView, 0);
			processInput(0, e);
			keyManager.sweep();
		}
	},
	run: function () {
		if (this.commands.length == 0) return true;

		if (this.isAsync && this.isRoot && isInteractive) {
			//devMode && console.log('*** starting ExCommandExecutor (async:' + this.editLogLevel + ') ***');
			if (this.editLogLevel == 0) {
				editLogger.open('excommand');
				this.running = true;

				this.editLogLevel++;
			}
			this.runAsyncNext();
			return false;
		}
		else {
			this.running = true;
			if (this.isRoot) {
				editLogger.open('excommand');
			}
			try {
				for (var i = 0, goal = this.commands.length; i < goal; i++) {
					if (!this._runCore(this.commands[i][0], this.commands[i][1])) {
						return this.lastError;
					}
				}
			}
			finally {
				if (this.isRoot) {
					editLogger.close();
					this.onFinish && this.onFinish(this);
				}
				this.commands.length = 0;
				this.running = false;
			}
			return true;
		}
	},
	get lastCommandObj () {
		return this.lastCommand ? this.lastCommand[0] : null;
	},
	get lastCommandArg () {
		return this.lastCommand ? this.lastCommand[1] : null;
	}
};

/*
 * low-level functions for application management {{{1
 * ----------------
 */

function getLocalStorage (keyName, callback) {
	if (extensionChannel) {
		extensionChannel.postMessage({type:'get-storage', key:keyName}, function (res) {
			callback && callback(res.value);
		});
	}
	else if (window.localStorage) {
		callback && callback(window.localStorage.getItem(keyName));
	}
}
function setLocalStorage (keyName, value) {
	if (extensionChannel) {
		extensionChannel.postMessage({type:'set-storage', key:keyName, value:value});
	}
	else if (window.localStorage) {
		localStorage.setItem(keyName, value);
	}
}
function isEditing (mode) {
	mode || (mode = inputMode);
	return mode == 'edit' || mode == 'edit-overwrite';
}
function install (x) {
	var count = 0;
	function load (loader) {
		loader();
		loader = null;
		++count;
	}
	function handleLoaded () {
		--count;
		count == 0 && installCore(x);
	}
	if (extensionChannel) {
		load(function () {
			registers = new Wasavi.Registers(appProxy, handleLoaded, testMode);
		});
		load(function () {
			lineInputHistories = new Wasavi.LineInputHistories(
				appProxy, config.vars.history, ['/', ':'], handleLoaded, testMode
			);
		});
		load(function () {
			bell = new Wasavi.Bell(appProxy, handleLoaded);
		});
	}
	else {
		registers = new Wasavi.Registers(appProxy);
		lineInputHistories = new Wasavi.LineInputHistories(
			appProxy, config.vars.history, ['/', ':']);
		bell = new Wasavi.Bell;
		installCore(x);
	}
}
function installCore (x) {
	/*
	 * DOM structure:
	 *
	 * style#wasavi_global_styles [style sheet]
	 *
	 * div#wasavi_container
	 *   |
	 *   + div#wasavi_editor [main editor screen] [POSITIONING TARGET]
	 *   |
	 *   + div#wasavi_footer [POSITIONING TARGET]
	 *   |   |
	 *   |   + div#wasavi_footer_modeline
	 *   |   |   |
	 *   |   |   + table#wasavi_footer_modeline_table
	 *   |   |       |
	 *   |   |       + tbody
	 *   |   |         |
	 *   |   |         + tr
	 *   |   |             |
	 *   |   |             + td#wasavi_footer_file_indicator [file name indicator]
	 *   |   |             |
	 *   |   |             + td#wasavi_footer_prefix_indicator [prefix input indicator]
	 *   |   |
	 *   |   + div#wasavi_footer_alter
	 *   |       |
	 *   |       + table#wasavi_footer_alter_table
	 *   |           |
	 *   |           + tbody
	 *   |             |
	 *   |             + tr
	 *   |                 |
	 *   |                 + td#wasavi_footer_input_indicator [header indicator]
	 *   |                 |
	 *   |                 + td#wasavi_footer_input_container
	 *   |                     |
	 *   |                     + input#wasavi_footer_input [line input editor]
	 *   |
	 *   + div#wasavi_console_container [POSITIONING TARGET]
	 *   |   |
	 *   |   + textarea#wasavi_console
	 *   |
	 *   + span#wasavi_singleline_scaler
	 *   |
	 *   + div#wasavi_console_scaler
	 *   |
	 *   + div#wasavi_command_cursor [normal mode cursor]
	 *   |   |
	 *   |   + span#wasavi_command_cursor_inner
	 *   |
	 *   + textarea#wasavi_edit_cursor [edit mode cursor]
	 *   |
	 *   + div#wasavi_cover [cover element]
	 *
	 */

	// container
	var cnt = $(CONTAINER_ID);
	if (!cnt) throw new Error('wasavi container not found');

	//
	var borderStyles = 'border:none;';
	var paddingStyle = 'padding:0;';
	var fontStyle = 'font:' + x.fontStyle + ';';
	var boxSizingPrefix = IS_GECKO ? '-moz-' : '';

	// scale line height
	var scaler = document.body.appendChild(document.createElement('span'));
	style(scaler, {
		font: x.fontStyle,
		textDecoration:'none',
		textShadow:'none',
		letterSpacing: '100%',
		whiteSpace:'pre',
		lineHeight:1
	});
	scaler.textContent = '0';
	lineHeight = scaler.offsetHeight;
	charWidth = scaler.offsetWidth;
	scaler.parentNode.removeChild(scaler);

	// style
	var styleElement = $('wasavi_global_styles');
	styleElement.appendChild(document.createTextNode([
'body { visibility:visible; } \
#wasavi_container { \
line-height:1; \
text-align:left; \
text-indent:0; \
text-decoration:none; \
text-shadow:none; \
} \
#wasavi_editor { \
display:block; \
margin:0; \
' + paddingStyle + borderStyles + ' \
' + boxSizingPrefix + 'box-sizing:border-box; \
' + fontStyle + ' \
overflow-x:hidden; \
overflow-y:scroll; \
counter-reset:n; \
word-break:break-all \
} \
#wasavi_textwidth_guide { \
display:none; \
position:fixed; \
' + boxSizingPrefix + 'box-sizing:border-box; \
left:0; top:0; width:32px; \
padding:4px 0 0 4px; \
border-left:1px solid silver; \
font-size:xx-small; \
font-style:italic; \
color:silver; \
} \
#wasavi_singleline_scaler { \
position:fixed; \
margin:0; \
padding:0; \
' + fontStyle + ' \
text-decoration:none; \
text-shadow:none; \
white-space:pre; \
color:#fff; \
background-color:#000; \
left:0px; \
top:0px; \
visibility:hidden \
} \
#wasavi_console_scaler { \
position:fixed; \
padding:0; \
border:none; \
font-family:' + fontFamily + '; \
font-size:10pt; \
left:0; \
top:0; \
white-space:pre-wrap; \
overflow-x:auto; \
color:#fff; \
background-color:#000; \
line-height:1; \
visibility:hidden \
} \
#wasavi_editor > div { \
margin:0; \
padding:0; \
min-height:' + lineHeight + 'px; \
white-space:pre-wrap; \
} \
#wasavi_editor > div:nth-child(odd) { \
} \
#wasavi_editor > div.current { \
} \
#wasavi_editor > div > span.wasavi_em { \
} \
#wasavi_editor > div > span.wasavi_composition { \
} \
#wasavi_editor.n > div:before { \
display:block; \
float:left; \
margin:0; \
padding:0 ' + charWidth + 'px 0 0; \
text-align:right; \
' + fontStyle + ' \
content:counter(n); \
} \
#wasavi_editor.a > div:before { \
counter-increment:n 1; \
} \
#wasavi_editor.r > div:before { \
counter-increment:n -1; \
} \
#wasavi_editor.r > div.current ~ div:before { \
counter-increment:n 1; \
}',

		(function () {
			var result = [];
			for (var i = 1; i <= LINE_NUMBER_MAX_WIDTH; i++) {
				result.push(
					'#wasavi_editor.n' + i + ' > div:before {' +
					'min-width:' + (LINE_NUMBER_MARGIN_LEFT + charWidth * i) + 'px;' +
					'max-width:' + (LINE_NUMBER_MARGIN_LEFT + charWidth * i) + 'px;' +
					'margin-left:-' + (LINE_NUMBER_MARGIN_LEFT + charWidth * (i + 1)) + 'px;' +
					'overflow:hidden;' +
					'}'
				);
				result.push(
					'#wasavi_editor.n' + i + ' > div {' +
					'margin-left:' + (LINE_NUMBER_MARGIN_LEFT + charWidth * (i + 1)) + 'px;' +
					'}'
				);
			}
			return result.join('\n');
		})(),

'#wasavi_footer { \
padding:2px 2px 1px 2px; \
font-family:' + fontFamily + '; \
font-size:10pt; \
line-height:1; \
overflow:hidden; \
' + boxSizingPrefix + 'box-sizing:content-box; \
} \
#wasavi_footer_modeline { \
' + boxSizingPrefix + 'box-sizing:border-box; \
} \
#wasavi_footer_alter { \
' + boxSizingPrefix + 'box-sizing:border-box; \
} \
#wasavi_footer_modeline_table,#wasavi_footer_alter_table { \
padding:0; \
margin:0; \
border-collapse:collapse; \
border:none; \
background-color:transparent \
} \
#wasavi_footer_modeline>table td,#wasavi_footer_alter>table td { \
border:none; \
padding:0; \
line-height:1; \
white-space:pre; \
} \
#wasavi_footer_file_indicator { \
padding:0; \
line-height:1; \
text-align:left; \
} \
#wasavi_footer_prefix_indicator { \
width:1px; \
padding:0; \
line-height:1; \
text-align:right; \
} \
#wasavi_footer_input_indicator { \
width:1px; \
padding:0; \
line-height:1; \
background-color:rgba(0,0,0,0.5) \
} \
#wasavi_footer_input_container { \
padding:0; \
background-color:transparent \
} \
#wasavi_footer_input { \
display:block; \
margin:0; \
padding:0; \
border:none; \
outline:none; \
font-family:' + fontFamily + '; \
font-size:10pt; \
line-height:1; \
width:100%; \
ime-mode:inactive \
} \
#wasavi_console_container { \
visibility:hidden; \
position:absolute; \
margin:0; \
padding:6px; \
' + boxSizingPrefix + 'box-sizing:border-box; \
border:none; \
border-radius:8px; \
} \
#wasavi_console { \
margin:0; \
padding:0; \
border:none; \
outline:none; \
background-color:transparent; \
width:100%; \
font-family:' + fontFamily + '; \
font-size:10pt; \
overflow-y:hidden; \
white-space:pre-wrap; \
resize:none; \
line-height:1; \
} \
#wasavi_command_cursor { \
position:absolute; \
margin:0; \
padding:0; \
' + fontStyle + ' \
text-decoration:none; \
text-shadow:none; \
left:0px; \
top:0px; \
} \
#wasavi_command_cursor_inner { \
margin:0; \
padding:0; \
white-space:pre \
} \
#wasavi_edit_cursor { \
position:absolute; \
display:none; \
margin:0; \
padding:0; \
' + boxSizingPrefix + 'box-sizing:border-box; \
border:none; \
background-color:transparent; \
' + fontStyle + ' \
text-decoration:none; \
text-shadow:none; \
overflow-y:hidden; \
resize:none; \
outline:none; \
} \
#wasavi_cover { \
position:fixed; \
left:0; top:0; right:0; bottom:0; \
background-color:rgba(0,0,0,0.0) \
} \
#wasavi_cover.dim { \
' + (CSS_PREFIX ? CSS_PREFIX + 'transition:background-color 0.5s linear 0s;' : '') + ' \
background-color:rgba(0,0,0,0.25); \
} \
#wasavi_focus_holder { \
position:fixed; \
border:none; \
outline:none; \
resize:none; \
padding:0; \
left:-4px; \
top:0px; \
width:100%; \
height:32px; \
background-color:transparent; \
ime-mode:disabled; \
}'
	].join('')));

	// theme
	theme.container = cnt;
	theme.fontStyle = fontStyle;
	theme.lineHeight = lineHeight;
	theme.select();
	theme.update();

	// focus holder
	var focusHolder = $('wasavi_focus_holder');

	// buffer
	buffer = new Wasavi.Editor($(EDITOR_CORE_ID));

	// text length scaler
	var textspan = $('wasavi_singleline_scaler');
	textspan.textContent = '#';

	// console scaler
	var conscaler = $('wasavi_console_scaler');
	conscaler.textContent = '#';

	// footer container
	var footer = $('wasavi_footer');

	// footer (default indicator)
	var footerDefault = $('wasavi_footer_modeline');
	$('wasavi_footer_file_indicator').textContent = '#';
	//footerDefault.textContent = '#';

	// footer (alter: line input)
	var footerAlter = $('wasavi_footer_alter');

	// footer alter contents
	var footerAlterTable = $('wasavi_footer_alter_table');
	var footerAlterRow = footerAlterTable.getElementsByTagName('tr')[0];

	// footer alter contents: indicator
	var footerIndicator = $('wasavi_footer_input_indicator');
	footerIndicator.textContent = '/';

	// footer alter contents: line input container
	var footerLineInputContainer = $('wasavi_footer_input_container');

	// footer alter contents: line input
	var footerInput = $('wasavi_footer_input');

	// console window
	var conwincnt = $('wasavi_console_container');
	var conwin = $('wasavi_console');
	conscaler.style.width = conwin.offsetWidth + 'px';

	// command cursor
	var cc = $('wasavi_command_cursor');
	var ccInner = $('wasavi_command_cursor_inner');
	ccInner.style.height = lineHeight + 'px';

	// textarea for insert mode
	var ec = $('wasavi_edit_cursor');

	// fix height
	if (footerDefault.offsetHeight < footerAlter.offsetHeight) {
		footerDefault.style.height = footerAlter.offsetHeight + 'px';
	}
	else if (footerAlter.offsetHeight < footerDefault.offsetHeight ) {
		footerAlter.style.height = footerDefault.offsetHeight + 'px';
	}
	footerAlter.style.display = 'none';

	/*
	 * visual settings
	 */

	setTabStop(config.vars.tabstop);
	setGeometory(x);

	/*
	 * initialize variables
	 */

	targetElement = x;
	fileName = '';
	preferredNewline = '\n';
	terminated = false;
	writeOnTermination = true;
	state = 'normal';
	runLevel = 0;
	inputModeStack = [];
	inputMode = 'command';
	inputModeSub = '';
	prefixInput = new Wasavi.PrefixInput;
	idealWidthPixels = idealDenotativeWidthPixels = -1;
	isEditCompleted = isVerticalMotion = isReadonlyWarned =
	isSmoothScrollRequested = isSimpleCommandUpdateRequested =
	isJumpBaseUpdateRequested = recordedStrokes = false;
	lastSimpleCommand = '';
	lastHorzFindCommand = {direction:0, letter:'', stopBefore:false};
	lastRegexFindCommand = new Wasavi.RegexFinderInfo;
	lastSubstituteInfo = new Collection;
	lastMessage = '';
	requestedState = {};

	buffer.value = x.value || '';
	buffer.selectionStart = x.selectionStart || 0;
	buffer.selectionEnd = x.selectionEnd || 0;

	inputHandler = new Wasavi.InputHandler(appProxy);
	marks = new Wasavi.Marks(appProxy, testMode);
	cursor = new Wasavi.CursorUI(appProxy, cc, ec, footerInput, focusHolder);
	scroller = new Wasavi.Scroller(appProxy, cursor, footerDefault);
	editLogger = new Wasavi.EditLogger(appProxy, config.vars.undolevels);
	exCommandExecutor = new ExCommandExecutor(true);
	backlog = new Wasavi.Backlog(appProxy, conwincnt, conwin, conscaler);
	searchUtils = new Wasavi.SearchUtils(appProxy);
	config.setData(x.readOnly ? 'readonly' : 'noreadonly');

	refreshIdealWidthPixels();
	showMessage(getFileIoResultInfo(x.value.length, true));

	x.value = undefined;

	/*
	 * execute exrc
	 */

	isInteractive = false;
	var result = executeExCommand(exrc, true);
	typeof result == 'string' && showMessage(result, true);
	exrc = '';

	/*
	 * show cursor
	 */

	cursor.ensureVisible();
	cursor.update({type:inputMode, focused:true, visible:true});

	/*
	 * set up channels
	 */

	if (extensionChannel) {
		fireEvent('initialized', {height:cnt.offsetHeight});
		extensionChannel.setMessageListener(handleExtensionChannelMessage);
	}

	/*
	 * set up event handlers
	 */

	setupEventHandlers(true);
}
function uninstall (save, implicit) {
	// apply the edited content to target textarea
	if (save && config.vars.modified) {
		targetElement.value = buffer.value;
	}

	// remove all event handlers
	setupEventHandlers(false);

	// clear all objects
	inputModeStack = undefined;
	prefixInput = undefined;
	pairBracketsIndicator && pairBracketsIndicator.dispose();
	pairBracketsIndicator = undefined;
	backlog = backlog.dispose();
	searchUtils = searchUtils.dispose();
	lastHorzFindCommand = undefined;
	lastRegexFindCommand = undefined;
	lastSubstituteInfo = undefined;
	requestedState = undefined;
	inputHandler = inputHandler.dispose();
	marks.save();
	marks = marks.dispose();
	cursor = cursor.dispose();
	scroller = scroller.dispose();
	editLogger = editLogger.dispose();
	keyManager = keyManager.dispose();
	theme = theme.dispose();
	l10n = l10n.dispose();
	emptyNodeContents($('wasavi_global_styles'));

	//
	if (extensionChannel) {
		delete targetElement.getAttribute;
		delete targetElement.setAttribute;
		targetElement.tabId = extensionChannel.tabId;
		targetElement.isTopFrame = !!WasaviExtensionWrapper.isTopFrame;
		targetElement.isImplicit = !!implicit;
		targetElement.ros = config.dumpScript(true).join('\n');
		fireEvent('terminated', targetElement);
		extensionChannel = extensionChannel.disconnect();
	}
	targetElement = null;
}
function setupEventHandlers (install) {
	var method = install ? 'addEventListener' : 'removeEventListener';

	// window
	window[method]('focus', handleWindowFocus, false);
	window[method]('blur', handleWindowBlur, false);
	window[method]('resize', handleWindowResize, false);

	// key manager
	install ? keyManager.install(handleKeydown2) :
			  keyManager.uninstall();

	var editor = $(EDITOR_CORE_ID);
	if (editor) {
		editor[method]('mousedown', handleMousedown, false);
		editor[method]('mouseup', handleMouseup, false);
	}

	var cover = $('wasavi_cover');
	if (cover) {
		cover[method]('mousedown', handleCoverMousedown, false);
		cover[method]('click', handleCoverClick, false);
		cover[method]('mousewheel', handleCoverMousewheel, false);
	}

	cursor.setupEventHandlers(method);
}
function setGeometory (target) {
	if (target == undefined) {
		target = targetElement;
	}
	if (!target) {
		return;
	}

	var container = $(CONTAINER_ID);
	var editor = $(EDITOR_CORE_ID);
	var footer = $('wasavi_footer');
	var conCon = $('wasavi_console_container');
	var con = $('wasavi_console');
	var conScaler = $('wasavi_console_scaler');
	var fmodTable = $('wasavi_footer_modeline_table');
	var faltTable = $('wasavi_footer_alter_table');

	if (!container || !editor || !footer || !conCon || !con || !conScaler
	||  !fmodTable || !faltTable) {
		throw new Error(
			'setGeometory: invalid element: ' +
			[
				container, editor, footer, con, conScaler, fmodTable, faltTable
			].join(', ')
		);
	}

	var rect = target.rect;

	if (isStandAlone) {
		rect.height -= footer.offsetHeight;
	}

	style(container, {
		width:rect.width + 'px',
		height:(rect.height + footer.offsetHeight) + 'px'
	});

	style(editor, {
		width:rect.width + 'px',
		height:rect.height + 'px'
	});

	style(footer, {
		width:(rect.width - 4) + 'px'
	});

	style(conCon, {
		left:'8px',
		top:'8px',
		width:(rect.width - 16) + 'px',
		height:(rect.height - 16) + 'px'
	});

	style(con, {
		height:(rect.height - (16 + 12)) + 'px'
	});

	style(conScaler, {
		width:(rect.width - 16) + 'px'
	});

	style(fmodTable, {
		width:(rect.width - 4) + 'px'
	});

	style(faltTable, {
		width:(rect.width - 4) + 'px'
	});

	config.setData('lines', parseInt(editor.clientHeight / lineHeight));
	config.setData('columns', parseInt(editor.clientWidth / charWidth));
}
function setInputMode (newInputMode, newInputModeSub, initial) {
	var newState;
	if (/^(?:command|edit|edit-overwrite|wait-a-letter|wait-register)$/.test(newInputMode)) {
		newState = 'normal';
	}
	else if (newInputMode == 'line-input') {
		newState = 'line-input';
	}
	else if (newInputMode == 'console-wait') {
		newState = 'console-wait';
	}
	if (newState != state) {
		switch (newState) {
		case 'normal':
			state = newState;
			inputMode = newInputMode;
			cursor.update({type:newInputMode, focused:true, visible:!backlog.visible});
			showPrefixInput();
			break;
		case 'line-input':
			state = newState;
			inputMode = newInputMode;
			showLineInput(initial);
			cursor.update({type:newInputMode, focused:true, visible:true});
			break;
		case 'console-wait':
			state = newState;
			inputMode = newInputMode;
			cursor.update({type:newInputMode, visible:!backlog.visible && newInputModeSub != 'ex-s'});
			break;
		}
	}
	else {
		inputMode = newInputMode;
	}
	inputModeSub = newInputModeSub || '';
}
function pushInputMode (mode, modeSub, initial) {
	inputModeStack.push(inputMode);
	setInputMode(mode, modeSub, initial);
}
function popInputMode () {
	if (inputModeStack.length) {
		setInputMode(inputModeStack.pop());
	}
	else {
		setInputMode('command');
	}
}
function getCursorPositionString () {
	if (buffer.elm.scrollHeight <= buffer.elm.clientHeight) {
		return _('All');
	}
	if (buffer.elm.scrollTop == 0) {
		return _('Top');
	}
	var viewHeight = buffer.elm.scrollHeight - buffer.elm.clientHeight;
	if (buffer.elm.scrollTop + buffer.elm.clientHeight >= buffer.elm.scrollHeight) {
		return _('Bot');
	}
	return ('  ' + Math.floor(buffer.elm.scrollTop / viewHeight * 100.)).substr(-3) + '%';
}
function getDefaultPrefixInputString () {
	// 000000,0000xxx000%
	return ((recordedStrokes ? _('[RECORDING]') + ' ' : '') +
		 ('     ' + (buffer.selectionStartRow + 1)).substr(-6) +
		 ',' + ((getLogicalColumn() + 1) + '   ').substr(0, 4) +
		 '   ' + getCursorPositionString());
}
function showPrefixInput (message) {
	if (state != 'normal') return;
	var line = $('wasavi_footer_modeline');
	var alter = $('wasavi_footer_alter');
	var indf = $('wasavi_footer_file_indicator');
	var indp = $('wasavi_footer_prefix_indicator');
	line.style.display = indf.style.display = indp.style.display = '';
	alter.style.display = 'none';
	switch (inputMode) {
	case 'edit':
		indf.textContent = config.vars.showmode ? _('--INSERT--') : getFileNameString();
		break;
	case 'edit-overwrite':
		indf.textContent = config.vars.showmode ? _('--OVERWRITE--') : getFileNameString();
		break;
	case 'command':
	default:
		indf.textContent = getFileNameString();
		break;
	}
	indp.textContent = message || prefixInput.toString() || getDefaultPrefixInputString();
}
function showMessage (message, emphasis, pseudoCursor, volatile_) {
	if (state != 'normal' && state != 'console-wait') return;
	var line = $('wasavi_footer_modeline');
	var alter = $('wasavi_footer_alter');
	var indf = $('wasavi_footer_file_indicator');
	var indp = $('wasavi_footer_prefix_indicator');
	line.style.display = indf.style.display = indp.style.display = '';
	alter.style.display = 'none';
	indf.style.fontWeight = 'bold';
	indp.textContent = '';
	var pa = line;
	if (emphasis) {
		emptyNodeContents(indf);
		var span = indf.appendChild(document.createElement('span'));
		span.style.color = theme.colors.warnedStatusFg;
		span.style.backgroundColor = theme.colors.warnedStatusBg;
		span.textContent = message;
		pa = span;
	}
	else {
		indf.textContent = message;
	}
	if (pseudoCursor) {
		var blink = indf.appendChild(document.createElement('blink'));
		blink.textContent = '\u2588';
	}
	if (message != '' && !volatile_) {
		lastMessage = toNativeControl(message);
	}
}
function showLineInput (initial) {
	if (state != 'line-input') return;
	var line = $('wasavi_footer_alter');
	var alter = $('wasavi_footer_modeline');
	var input = $(LINE_INPUT_ID);
	line.style.display = 'block';
	alter.style.display = 'none';
	$('wasavi_footer_input_indicator').textContent = initial;
	input.value = '';
	dataset(input, 'current', '');
}
function requestShowPrefixInput (message) {
	if (!requestedState.modeline) {
		requestedState.modeline = {type:'prefix', message:message};
	}
	return message;
}
function requestShowMessage (message, emphasis, pseudoCursor, volatile_) {
	if (!requestedState.modeline) {
		requestedState.modeline = {
			type:'message',
			message:message,
			emphasis:!!emphasis,
			pseudoCursor:!!pseudoCursor,
			volatile_:!!volatile_
		};
	}
	return message;
}
function requestRegisterNotice (message) {
	if (!requestedState.notice) {
		requestedState.notice = {play:true};
		if (arguments.length) {
			requestedState.notice.message = message;
		}
	}
	return message;
}
function requestInputMode (mode, modeSub, initial, updateCursor) {
	if (!requestedState.inputMode) {
		requestedState.inputMode = {
			mode:mode,
			modeSub:modeSub || '',
			initial:initial || '',
			updateCursor:updateCursor
		};
	}
}
function requestSimpleCommandUpdate () {
	if (runLevel == 0) {
		isSimpleCommandUpdateRequested = true;
	}
}
function executeExCommand (source, isRoot, parseOnly) {
	// @see http://pubs.opengroup.org/onlinepubs/9699919799/utilities/ex.html#tag_20_40_13_03

	var resultMessage;
	var lastTerminator;
	var commandName = '';
	var commandArg = '';
	var commandArgSups;
	var commandObj = null;
	var range = null;
	var executor = isRoot ? exCommandExecutor : new ExCommandExecutor();

	function getRegex (delimiter) {
		delimiter = '\\u' + ('000' + delimiter.charCodeAt(0).toString(16)).substr(-4);
		return new RegExp('\\n|' + delimiter, 'g');
	}

	function skipblank () {
		var re = /^[ \t]+/.exec(source);
		if (re) {
			commandArg += re[0];
			source = source.substring(re[0].length);
		}
	}
	function skipto (regex, opts) {
		opts || (opts = {});
		var escapeChars = opts.escapeChars || '\\';
		var discard = opts.discard;
		var re = regex.exec(source);
		if (re) {
			do {
				var index = regex.lastIndex - re[0].length;
				if (index == 0 || escapeChars.indexOf(source.charAt(index - 1)) < 0) {
					if (!discard) {
						if (commandArgSups) {
							commandArgSups.push(source.substring(0, index));
						}
						else {
							commandArg += source.substring(0, index);
						}
					}
					source = source.substring(index);
					return;
				}
			} while ((re = regex.exec(source)));
		}
		if (!discard) {
			commandArg = source;
		}
		source = '';
	}

	function skipto2 (regex, delimiter) {
		var escapeChars = '\\';
		var re = regex.exec(source);
		var found = 0;
		var fragmentStart = 0;
		if (re) {
			do {
				var index = regex.lastIndex - re[0].length;
				if (index == 0 || escapeChars.indexOf(source.charAt(index - 1)) < 0) {
					found++;
					commandArgSups.push(source.substring(fragmentStart, index));
					fragmentStart = regex.lastIndex;
					if (re[0] == '\n' || re[0] == delimiter && found == 2) {
						source = source.substring(index);
						return;
					}
				}
			} while ((re = regex.exec(source)));
		}
		commandArg = source;
		source = '';
	}

	function pushCommand () {
		var r;
		if (commandObj.rangeCount == 0) {
			if (range.rows.length) {
				resultMessage = _('{0}: extra range specified.', commandObj.name);
				return false;
			}
			r = [];
		}
		else {
			r = range.rows.last(buffer, commandObj.rangeCount, commandObj.flags.addr2All);
			if (typeof r == 'string') {
				resultMessage = r;
				return false;
			}
		}

		var args = commandObj.buildArgs(appProxy, r, commandArg, commandArgSups);
		if (typeof args == 'string') {
			resultMessage = args || _('{0}: unknown syntax error.', commandObj.name);
			return false;
		}

		executor.add(commandObj, args);
		return true;
	}

	function paragraph12 () {
		if (/^(?:map|unmap|abbreviate|unabbreviate)$/.test(commandName)) {
			skipto(/[\n|"]/g, {escapeChars:'\u0016'});
		}
		else {
			skipto(/[\n|"]/g);
		}
		if (/^(?:append|change|insert)$/.test(commandName) && source.charAt(0) == '|') {
			skipto(/\n/g);
		}
		if (source.charAt(0) == '"') {
			skipto(/\n/g, {discard:true});
		}
		if (commandName == 'print' && commandArg == '') {
			commandArg = 'p';
		}
		lastTerminator = source.charAt(0);
		source = source.substring(1);
	}

	if (/[\\\u0016]$/.test(source)) {
		source = source.substring(0, source.length - 1);
	}
	if (!/\n$/.test(source)) {
		source += '\n';
	}
	if (isRoot) {
		exCommandExecutor.isGlobalSpecified = false;
	}

	executor.clear();
	executor.source = source.replace(/\n+$/, '');

	while (source.length && !terminated) {
		commandName = commandArg = '';
		commandObj = null;

		// 1. Leading <colon> characters shall be skipped.
		// 2. Leading <blank> characters shall be skipped.
		source = source.replace(/^[: \t]+/, '');

		// 3. If the leading character is a double-quote character, the characters up to and
		// including the next non- <backslash>-escaped <newline> shall be discarded, and any
		// subsequent characters shall be parsed as a separate command.
		if (/^"/.test(source)) {
			skipto(/\n/g, {discard:true});
			lastTerminator = source.charAt(0);
			source = source.substring(1);
			continue;
		}

		// 4. Leading characters that can be interpreted as addresses shall be evaluate;
		// see Addressing in ex
		// (http://pubs.opengroup.org/onlinepubs/9699919799/utilities/ex.html#tag_20_40_13_02).
		range = Wasavi.ExCommand.prototype.parseRange(appProxy, source, undefined, true);
		if (typeof range == 'string') {
			resultMessage = range;
			break;
		}
		source = range.rest;

		// 5. Leading <blank> characters shall be skipped.
		source = source.replace(/^[: \t]+/, '');

		// 6. If the next character is a <vertical-line> character or a <newline>:
		//
		//   a. If the next character is a <newline>:
		//
		//     i. If ex is in open or visual mode, the current line shall be set to the last
		//     address specified, if any.
		//
		//     ii. Otherwise, if the last command was terminated by a <vertical-line> character,
		//     no action shall be taken; for example, the command "||<newline>" shall execute
		//     two implied commands, not three.
		//
		//     iii. Otherwise, step 6.b. shall apply.
		//
		//   b. Otherwise, the implied command shall be the print command. The last #, p, and l
		//   flags specified to any ex command shall be remembered and shall apply to this
		//   implied command. Executing the ex number, print, or list command shall set the
		//   remembered flags to #, nothing, and l, respectively, plus any other flags
		//   specified for that execution of the number, print, or list command.
		//
		//   If ex is not currently performing a global or v command, and no address or count
		//   is specified, the current line shall be incremented by 1 before the command is
		//   executed. If incrementing the current line would result in an address past the
		//   last line in the edit buffer, the command shall fail, and the increment shall not
		//   happen.
		//
		//   c. The <newline> or <vertical-line> character shall be discarded and any
		//   subsequent characters shall be parsed as a separate command.
		if (source.charAt(0) == '|' || source.charAt(0) == '\n') {
			switch (source.charAt(0)) {
			case '\n':
				isJumpBaseUpdateRequested = false;
				if (range && range.rows.length) {
					commandObj = Wasavi.ExCommand.defaultCommand;
					break;
				}
				if (lastTerminator == undefined || lastTerminator == '|') {
					break;
				}
				/*FALLTHRU*/

			case '|':
				commandObj = Wasavi.ExCommand.defaultCommand;
				commandArg = 'p';
				break;
			}

			lastTerminator = source.charAt(0);
			source = source.substring(1);

			if (commandObj && !pushCommand()) {
				break;
			}

			continue;
		}

		// 7. The command name shall be comprised of the next character (if the character
		// is not alphabetic), or the next character and any subsequent alphabetic characters
		// (if the character is alphabetic), with the following exceptions:
		//
		//   a. Commands that consist of any prefix of the characters in the command name
		//   delete, followed immediately by any of the characters 'l' , 'p' , '+' , '-' , or
		//   '#' shall be interpreted as a delete command, followed by a <blank>, followed by
		//   the characters that were not part of the prefix of the delete command. The maximum
		//   number of characters shall be matched to the command name delete; for example,
		//   "del" shall not be treated as "de" followed by the flag l.
		//
		//   b. Commands that consist of the character 'k' , followed by a character that can
		//   be used as the name of a mark, shall be equivalent to the mark command followed
		//   by a <blank>, followed by the character that followed the 'k' .
		//
		//   c. Commands that consist of the character 's' , followed by characters that could
		//   be interpreted as valid options to the s command, shall be the equivalent of the
		//   s command, without any pattern or replacement values, followed by a <blank>,
		//   followed by the characters after the 's' .
		if (/^[a-z]/i.test(source)) {
			if (/^(?:k\s*[a-zA-Z]|s\s*[^a-zA-Z \\|\n"])/.test(source)) {
				commandName = source.charAt(0);
				source = source.substring(1);
			}
			else {
				var re = /^[a-z]+/i.exec(source);
				commandName = re[0];
				source = source.substring(re[0].length);
			}
		}
		else {
			commandName = source.charAt(0);
			source = source.substring(1);
		}

		// 8.The command name shall be matched against the possible command names, and a
		// command name that contains a prefix matching the characters specified by the user
		// shall be the executed command. In the case of commands where the characters
		// specified by the user could be ambiguous, the executed command shall be as
		// follows:
		//
		//   a:  append    n:  next    t:  t
		//   c:  change    p:  print   u:  undo
		//   ch: change    pr: print   un: undo
		//   e:  edit      r:  read    v:  v
		//   m:  move      re: read    w:  write
		//   ma: mark      s:  s
		//
		// Implementation extensions with names causing similar ambiguities shall not be
		// checked for a match until all possible matches for commands specified by
		// POSIX.1-2008 have been checked.
		for (var i = 0, commands = Wasavi.ExCommand.commands; i < commands.length; i++) {
			if (commandName.indexOf(commands[i].shortName) == 0
			&&  commands[i].name.indexOf(commandName) == 0) {
				for (var j = 0; j < commands[i].name.length; j++) {
					if (commandName.charCodeAt(j) != commands[i].name.charCodeAt(j)) {
						source = commandName.substring(j) + source;
						break;
					}
				}
				commandObj = commands[i];
				commandName = commands[i].name;
				break;
			}
		}

		// 9. (wasavi supports neither '!' nor 'read' command)

		// 10. Otherwise, if the command is an edit, ex, or next command, or a visual command
		// while in open or visual mode, the next part of the command shall be parsed as
		// follows:
		//
		//   a. Any '!' character immediately following the command shall be skipped and be
		//   part of the command.
		//
		//   b. Any leading <blank> characters shall be skipped and be part of the command.
		//
		//   c. If the next character is a '+' , characters up to the first non- <backslash>-
		//   escaped <newline> or non- <backslash>-escaped <blank> shall be skipped and be part
		//   of the command.
		//
		//   d. The rest of the command shall be determined by the steps specified in paragraph
		//   12.
		if (/^(?:edit|ex|next|visual)$/.test(commandName)) {
			if (source.charAt(0) == '!') {
				commandArg += source.charAt(0);
				source = source.substring(1);
			}
			skipblank();
			if (source.charAt(0) == '+') {
				skipto(/[\n \t]/g);
			}
			paragraph12();
		}

		// 11. Otherwise, if the command is a global, open, s, or v command, the next part of
		// the command shall be parsed as follows:
		//
		//   a. Any leading <blank> characters shall be skipped and be part of the command.
		//
		//   b. If the next character is not an alphanumeric, double-quote, <newline>,
		//   <backslash>, or <vertical-line> character:
		//
		//     i. The next character shall be used as a command delimiter.
		//
		//     ii. If the command is a global, open, or v command, characters up to the first
		//     non- <backslash>-escaped <newline>, or first non- <backslash>-escaped delimiter
		//     character, shall be skipped and be part of the command.
		//
		//     iii. If the command is an s command, characters up to the first non- <backslash>
		//     -escaped <newline>, or second non- <backslash>-escaped delimiter character,
		//     shall be skipped and be part of the command.
		//
		//   c. If the command is a global or v command, characters up to the first non-
		//   <backslash>-escaped <newline> shall be skipped and be part of the command.
		//
		//   d. Otherwise, the rest of the command shall be determined by the steps specified
		//   in paragraph 12.
		else if (/^(?:global|open|s|v)$/.test(commandName)) {
			skipblank();
			if (/^(?:[^a-zA-Z"\n\\|])/.test(source)) {
				var delimiter = source.charAt(0);
				commandArgSups = [];
				source = source.substring(1);

				if (commandName != 's') {
					skipto(getRegex(delimiter));
				}
				else {
					skipto2(getRegex(delimiter), delimiter);
				}
				if (source.charAt(0) == delimiter) {
					source = source.substring(1);
				}
			}
			if (/^(?:global|v)$/.test(commandName)) {
				if (exCommandExecutor.isGlobalSpecified) {
					resultMessage = _('Cannot use the global or v command recursively.');
					break;
				}
				exCommandExecutor.isGlobalSpecified = true;
				skipto(/\n/g);
				lastTerminator = source.charAt(0);
				source = source.substring(1);
			}
			else {
				paragraph12();
			}
		}

		// 12. Otherwise:
		//
		//   a. If the command was a map, unmap, abbreviate, or unabbreviate command,
		//   characters up to the first non- <control>-V-escaped <newline>, <vertical-line>,
		//   or double-quote character shall be skipped and be part of the command.
		//
		//   b. Otherwise, characters up to the first non- <backslash>-escaped <newline>,
		//   <vertical-line>, or double-quote character shall be skipped and be part of the
		//   command.
		//
		//   c. If the command was an append, change, or insert command, and the step 12.b.
		//   ended at a <vertical-line> character, any subsequent characters, up to the next
		//   non- <backslash>-escaped <newline> shall be used as input text to the command.
		//
		//   d. If the command was ended by a double-quote character, all subsequent
		//   characters, up to the next non- <backslash>-escaped <newline>, shall be discarded.
		//
		//   e. The terminating <newline> or <vertical-line> character shall be discarded and
		//   any subsequent characters shall be parsed as a separate ex command.
		else {
			paragraph12();
		}

		if (commandObj && !pushCommand()) {
			break;
		}
		if (!commandObj && commandName != '') {
			resultMessage = _('{0}: unknown command.', commandName);
			break;
		}
	}

	if (typeof resultMessage == 'string') {
		return resultMessage;
	}

	return parseOnly ? executor : executor.run();
}
function executeViCommand (arg, keepRunLevel) {
	var input = $(LINE_INPUT_ID);
	var cursorState = {visible:cursor.visible};
	cursor.update({visible:false});
	cursor.locked = true;

	var prefixInputSaved = prefixInput.clone();
	prefixInput.reset();

	!keepRunLevel && runLevel++;

	try {
		var cmd = keyManager.createSequences(arg);
		for (var i = 0, goal = cmd.length; i < goal; i++) {
			mapManager.process(cmd[i], function (keyCode, e) {
				processInput(keyCode, e);
			});
		}
		mapManager.process(false);
	}
	finally {
		!keepRunLevel && runLevel--;

		if (prefixInput) {
			prefixInput.assign(prefixInputSaved);
		}

		if (cursor) {
			cursor.locked = false;
			cursor.ensureVisible();
			cursor.update(cursorState);
		}
	}
}
function processInput (code, e, ignoreAbbreviation) {
	function completeSelectionRange (ss, se) {
		if (buffer.selectionStart.gt(ss) && buffer.selectionStart.gt(se)) {
			buffer.setSelectionRange(buffer.selectionStart);
		}
		else if (buffer.selectionEnd.lt(ss) && buffer.selectionEnd.lt(se)) {
			buffer.setSelectionRange(buffer.selectionEnd);
		}
		else if (buffer.selectionStart.ne(ss) && buffer.selectionEnd.eq(se)) {
			buffer.setSelectionRange(buffer.selectionStart);
		}
		else if (buffer.selectionStart.eq(ss) && buffer.selectionEnd.ne(se)) {
			buffer.setSelectionRange(buffer.selectionEnd);
		}
	}
	function doEditComplete () {
		config.setData('modified');
		lastRegexFindCommand.text = null;
		if (config.vars.readonly && !isReadonlyWarned) {
			isReadonlyWarned = true;
			requestShowMessage(requestRegisterNotice(_('Warning: changing readonly element.')), true);
		}
	}
	function execCommandMap (t, key, subkey, code) {
		testMode && fireEvent('command-start');
		lastMessage = '';

		var map = commandMap;
		var ss = buffer.selectionStart;
		var se = buffer.selectionEnd;
		var result = execMap(t, e, map, key, subkey, code);

		if (result) {
			var canContinue = true;

			if (prefixInput.operation.length) {
				canContinue = execMap(
					t, e, map, prefixInput.operation, '@op', code, {s:ss, e:se}
				);
			}
			if (canContinue !== false) {
				isEditCompleted && doEditComplete();
				completeSelectionRange(ss, se);

				buffer.isLineOrientSelection =
				isEditCompleted =
				isVerticalMotion =
				isSmoothScrollRequested = false;

				if (isSimpleCommandUpdateRequested) {
					lastSimpleCommand = prefixInput.toString();
					isSimpleCommandUpdateRequested = false;
				}

				if (!scroller.running) {
					needEmitEvent = true;
				}

				prefixInput.reset();
				requestShowPrefixInput();
			}
		}
		else {
			needEmitEvent = true;
		}
		if (requestedState.inputMode) {
			cursor.ensureVisible(false);
		}
		else {
			cursor.ensureVisible(isSmoothScrollRequested);
		}
		if (!requestedState.inputMode || !requestedState.inputMode.updateCursor) {
			cursor.update(scroller.running || state != 'normal' ?
				{visible:false} : {focused:true, visible:true});
		}
	}
	function execEditMap (t, key, subkey, code) {
		if (editMap[key]) {
			var ss = t.selectionStart;
			var se = t.selectionEnd;
			cursor.update({visible:false});
			execMap(t, e, editMap, key, subkey, code);
			completeSelectionRange(ss, se);
			cursor.ensureVisible();
			cursor.update({focused:true, visible:true});

			return true;
		}
		return false;
	}
	function execLineInputEditMap (t, key, subkey, code) {
		if (lineInputEditMap[key]) {
			execMap(t, e, lineInputEditMap, key, subkey, code);
			return true;
		}
		return false;
	}
	function processAbbrevs (force) {
		if (ignoreAbbreviation) return;

		var regex = config.vars.iskeyword;
		var target, last;

		if (force) {
			if (inputHandler.text.length < 1) return;
			target = inputHandler.text;
			last = '';
		}
		else {
			if (inputHandler.text.length < 2) return;
			target = inputHandler.text.substring(0, inputHandler.text.length - 1);
			last = inputHandler.text.substr(-1);
			if (!(regex.test(target.substr(-1)) && !regex.test(last))) return;
		}

		for (var i in abbrevs) {
			if (target.substr(-i.length) != i) continue;

			var canTransit = false;
			if (regex.test(i.charAt(0))) {
				if (i.length == 1) {
					if (buffer.selectionStartCol - i.length <= 1
					||  target.length - i.length <= 0
					||  /[ \t]/.test(target.substr(-(i.length + 1), 1))) {
						canTransit = true;
					}
				}
				else {
					if (buffer.selectionStartCol - i.length <= 1
					||  target.length - i.length <= 0
					||  !regex.test(target.substr(-(i.length + 1), 1))) {
						canTransit = true;
					}
				}
			}
			else {
				if (buffer.selectionStartCol - i.length <= 1
				||  target.length - i.length <= 0
				||  regex.test(target.substr(-(i.length + 1), 1))
				||  /[ \t]/.test(target.substr(-(i.length + 1), 1))) {
					canTransit = true;
				}
			}
			if (!canTransit) continue;

			inputHandler.text = target + multiply('\u0008', i.length) + abbrevs[i] + last;
			deleteCharsBackward(i.length + last.length);
			(inputMode == 'edit' ? insert : overwrite)(abbrevs[i] + last);
			break;
		}
	}
	function processAutoDivide (e) {
		if (config.vars.textwidth <= 0) return;

		var limitWidth = charWidth * config.vars.textwidth;
		var tmpMark = 'auto-format';
		var scaler = $('wasavi_singleline_scaler');
		var inputStateSaved;
		var prepared = false;

		while (true) {
			var line = buffer.rows(buffer.selectionStartRow);
			var overed = false;
			var breakItem = false;
			var lastIndex = 0;

			scaler.textContent = '';
			var lb = lineBreaker.run(line, function (item) {
				if (!item) return false;

				scaler.textContent += line.substring(lastIndex, item.index + item.length);
				lastIndex = item.index + item.length;

				if (item.codePoint != 32 && item.codePoint != 9
				&& scaler.offsetWidth > limitWidth) {
					overed = true;
				}
				else if (unicodeUtils.canBreak(item.breakAction)) {
					breakItem = item;
				}

				return overed && !!breakItem;
			});

			if (!overed || !breakItem) {
				break;
			}
			if (!prepared) {
				prepared = true;
				inputHandler.ungetText();
				inputHandler.flush();
				marks.setPrivate(tmpMark, buffer.selectionStart);
				inputStateSaved = {
					text:inputHandler.text,
					textFragment:inputHandler.textFragment
				};
			}

			buffer.setSelectionRange(new Position(
				buffer.selectionStartRow, breakItem.index + breakItem.length));

			var n = buffer.selectionStart;
			while (n.col > 0) {
				var left = buffer.leftPos(n);
				if (!/[ \t]/.test(buffer.charAt(left))) {
					break;
				}
				n = left;
			}
			if (n.lt(buffer.selectionEnd)) {
				buffer.selectionStart = n;
				deleteSelection();
			}

			inputHandler.inputHeadPosition = buffer.selectionStart;
			inputHandler.textFragment = '';
			var newlineObj = keyManager.objectFromCode(0x000d);
			inputHandler.updateText(newlineObj);
			execMap(buffer, newlineObj, editMap, '\u000d', '', '\u000d');
			inputHandler.flush();
		}

		if (prepared) {
			buffer.setSelectionRange(marks.getPrivate(tmpMark));
			marks.setPrivate(tmpMark);
			inputHandler.inputHeadPosition = buffer.leftPos(buffer.selectionStart);
			inputHandler.text = inputStateSaved.text;
			inputHandler.textFragment = inputStateSaved.textFragment;
			inputHandler.updateText(e);
		}
	}

	var input = $(LINE_INPUT_ID);
	var letter = keyManager.code2letter(code);
	var mapkey = keyManager.code2letter(code, true);
	var subkey = inputMode;
	var result = false;
	var needEmitEvent = false;

	switch (inputModeSub) {
	case 'wait-a-letter':
		mapkey = keyManager.code2letter(lastKeyCode, true);
		subkey = inputModeSub;
		inputModeSub = '';
		break;

	case 'wait-register':
		if (registers.isReadable(letter)) {
			mapkey = keyManager.code2letter(lastKeyCode, true);
			subkey = inputModeSub;
			inputModeSub = '';
		}
		else {
			inputModeSub = '';
			lastKeyCode = code;
			return true;
		}
		break;

	case 'backlog':
		if (backlog.queued) {
			if (letter == 'q') {
				backlog.clear();
				backlog.hide();
				popInputMode();
				inputModeSub = '';
				return true;
			}
			else if (letter == ':') {
				backlog.clear();
				popInputMode();
				subkey = inputMode;
				inputModeSub = '';
				break;
			}
			else {
				backlog.write(letter == '\u000d');
				return true;
			}
		}
		else {
			letter != ':' && backlog.hide();
			popInputMode();
			subkey = inputMode;
			inputModeSub = '';
			if (letter == '\u000d' || letter == ' ' || state != 'normal') {
				return true;
			}
		}
		break;

	case 'ex-s':
		if (!substituteWorker.kontinue(letter)) {
			substituteWorker = null;
			inputModeSub = '';
			cursor.ensureVisible();
			cursor.update({visible:true});
		}
		fireCommandCompleteEvent();
		return true;

	default:
		inputModeSub = '';
	}

	switch (inputMode) {
	case 'command':
		cursor.windup();
		execCommandMap(buffer, mapkey, subkey, code);
		result = true;
		break;

	case 'edit':
	case 'edit-overwrite':
		cursor.windup();

		if (subkey == inputMode && code == 0x1b) {
			config.vars.showmatch && pairBracketsIndicator && pairBracketsIndicator.clear();
			processAbbrevs(true);

			var finalStroke = inputHandler.stroke;
			var finalStrokeFollowed = inputHandler.suffix + finalStroke;

			if (inputHandler.count > 1) {
				var cmd = keyManager.createSequences(finalStrokeFollowed);
				for (var i = 1; i < inputHandler.count; i++) {
					for (var j = 0, goal = cmd.length; j < goal; j++) {
						processInput(cmd[j].code, cmd[j]);
					}
				}
			}

			inputHandler.close();

			var n = buffer.selectionStart;
			inputHandler.setStartPosition(n);
			n.col = Math.max(n.col - 1, 0);
			buffer.setSelectionRange(n);

			popInputMode();
			prefixInput.isLocked = false;
			prefixInput.trailer = finalStroke;
			registers.set('.', finalStroke);

			cursor.ensureVisible();
			cursor.update({type:inputMode, visible:true});

			if (runLevel == 0 && isSimpleCommandUpdateRequested) {
				lastSimpleCommand = prefixInput.toString() + letter;
				isSimpleCommandUpdateRequested = false;
			}

			(isEditCompleted || finalStroke != '') && doEditComplete();
			prefixInput.reset();
			isEditCompleted = isVerticalMotion = isSmoothScrollRequested = false;
			requestShowPrefixInput();
			editLogger.close();// edit-wrapper
			needEmitEvent = true;
			idealWidthPixels = -1;
		}
		else {
			var letterActual = inputHandler.updateText(e);
			var prevPos = buffer.selectionStart;
			inputHandler.updateStroke(e);
			inputHandler.updateHeadPosition();

			if (config.vars.showmatch && pairBracketsIndicator) {
				pairBracketsIndicator.clear();
				pairBracketsIndicator = null;
			}
			if (execEditMap(buffer, mapkey, subkey, code)) {
				requestShowPrefixInput(getDefaultPrefixInputString());
			}
			else {
				if ((code == 0x08 || code == 0x0a || code >= 32) && !clipOverrun()) {
					(inputMode == 'edit' ? insert : overwrite)(letterActual);
					processAutoDivide(e);
					processAbbrevs();
				}
				else {
					inputHandler.ungetText();
				}
				if (runLevel == 0 && e.isCompositionedFirst) {
					cursor.editCursor.style.display = 'none';
					isBulkInputting = true;
				}
				if (runLevel == 0 && (!e.isCompositioned || e.isCompositionedLast)) {
					isBulkInputting = false;
					cursor.ensureVisible();
					cursor.update({visible:true, focused:true});
					requestShowPrefixInput(getDefaultPrefixInputString());
				}
			}
			if (config.vars.showmatch && !pairBracketsIndicator) {
				pairBracketsIndicator = searchUtils.getPairBracketsIndicator(
					letterActual, buffer, prevPos);
			}
			needEmitEvent = 'notify-state';
		}
		result = true;
		break;

	case 'line-input':
		var canEscape = code == 0x1b
			|| code == 0x08 && input.selectionStart == 0 && input.selectionEnd == 0;

		dataset(input, 'current', input.value);

		if (subkey == inputMode && canEscape) {
			mapkey = prefixInput.motion || prefixInput.operation;
			backlog.hide();
			execMap(
				buffer, e, commandMap,
				mapkey, '@' + inputMode + '-escape', input.value);
			popInputMode();
			prefixInput.reset();
			requestShowPrefixInput();
		}
		else if (subkey == inputMode && (code == 0x0d || code == 0x0a)) {
			var line = toNativeControl(input.value);
			prefixInput.trailer = line + keyManager.code2letter(code);
			mapkey = prefixInput.motion || prefixInput.operation;
			execMap(
				buffer, e, commandMap,
				mapkey, '@' + inputMode + '-reset', line);
			execCommandMap(buffer, mapkey, subkey, line);

			popInputMode();
			prefixInput.reset();
		}
		else if (execLineInputEditMap(input, mapkey, subkey, code)) {
			setTimeout(function () {
				var input = $(LINE_INPUT_ID);
				if (input.value != dataset(input, 'current')) {
					processInputSupplement();
				}
			}, 1);
		}
		else if (code >= 32) {
			lineInputHistories.isInitial = true;
			if (!e.isCompositioned) {
				insertToLineInput(input, letter);
			}
			if (!e.isCompositioned || e.isCompositionedLast) {
				processInputSupplement();
				keyManager.init(input);
			}
		}
		result = true;
		break;

	default:
		result = true;
	}

	if (terminated) {
		uninstall(writeOnTermination);
	}
	else {
		if (requestedState.inputMode) {
			var im = requestedState.inputMode;
			pushInputMode(im.mode, im.modeSub, im.initial);
			im.updateCursor && cursor.update({focused:true, visible:true});
			requestedState.inputMode = null;
		}
		var messageUpdated = false;
		if (requestedState.modeline) {
			switch (requestedState.modeline.type) {
			case 'prefix':
				showPrefixInput(requestedState.modeline.message);
				break;
			case 'message':
				messageUpdated = true;
				showMessage(
					requestedState.modeline.message,
					requestedState.modeline.emphasis,
					requestedState.modeline.pseudoCursor,
					requestedState.modeline.volatile_
				);
				break;
			}
			requestedState.modeline = null;
			config.vars.errorbells && requestRegisterNotice();
			needEmitEvent = true;
		}
		if (requestedState.notice) {
			if (requestedState.notice.play) {
				bell.play();
			}
			if (requestedState.notice.message) {
				lastMessage = toNativeControl(requestedState.notice.message);
				devMode && console.log(requestedState.notice.message);
			}
			requestedState.notice = null;
			needEmitEvent = true;
		}
		if (runLevel == 0 && state == 'normal' && (backlog.queued || backlog.visible)) {
			backlog.write(false, messageUpdated);
		}
		if (needEmitEvent !== false) {
			if (needEmitEvent === true) {
				fireCommandCompleteEvent();
			}
			else if (typeof needEmitEvent == 'string') {
				fireCommandCompleteEvent(needEmitEvent);
			}
		}
	}
	if (!isLastKeyCodeLocked) {
		lastKeyCode = code;
	}
	return result;
}
function processInputSupplement () {
	if (inputMode != 'line-input') return;
	var input = $(LINE_INPUT_ID);
	var key = prefixInput.motion || prefixInput.operation;
	var e = keyManager.nopObjectFromCode();
	execMap(buffer, e, commandMap, key, '@' + inputMode + '-reset', input.value);
	execMap(buffer, e, commandMap, key, '@' + inputMode + '-notify', input.value);
}
function getFindRegex (src) {
	var result;
	var pattern = '';
	var caseSensibility = false;
	var magic = false;
	if (src instanceof RegExp) {
		return src;
	}
	else if (typeof src == 'string') {
		pattern = src;
	}
	else if (typeof src == 'object') {
		if ('csOverride' in src) {
			caseSensibility = src.csOverride;
		}
		if ('magicOverride' in src) {
			magic = src.magicOverride;
		}
		if ('pattern' in src) {
			pattern = src.pattern;
		}
		else if ('regex' in src && src.regex instanceof RegExp) {
			pattern = src.regex.source;
			magic = true;
		}
	}
	if (caseSensibility === false) {
		caseSensibility =
			config.vars.smartcase && !/[A-Z]/.test(pattern) || config.vars.ignorecase ? 'i' : '';
	}
	try {
		result = new RegExp(
			magic ? pattern : regexConverter.toJsRegexString(pattern),
			caseSensibility + 'gm');
	}
	catch (e) {
		result = null;
	}
	return result;
}
function getFileNameString () {
	var result = '';
	if (extensionChannel && WasaviExtensionWrapper.isTopFrame) {
		if (fileName == '') {
			result = _('*Untitled*');
		}
		else {
			result = fileName;
		}
	}
	else if (targetElement) {
		if (targetElement.id != '') {
			result = targetElement.nodeName + '#' + targetElement.id;
		}
		else {
			result = targetElement.nodeName;
		}
	}
	if (config.vars.modified) {
		result += ' [+]';
	}
	return result;
}
function getCaretPositionString () {
	if (buffer.rowLength == 1 && buffer.rows(0) == '') {
		return _('--No lines in buffer--');
	}
	else {
		return _('line {0} of {1} ({2}%)',
			buffer.selectionStartRow + 1,
			buffer.rowLength,
			parseInt(buffer.selectionStartRow / buffer.rowLength * 100.0));
	}
}
function getNewlineType (newline) {
	return {'\r\n':'dos', '\r':'mac', '\n':'unix'}[newline] || '?';
}
function getFileIoResultInfo (charLength, isNew) {
	var result = [];
	var attribs = [];

	// file name
	result.push('"' + getFileNameString() + '"');

	// partial attributes
	attribs.push(getNewlineType(preferredNewline)); // newline type
	result.push('[' + attribs.join(', ') + ']');

	// current line number
	var rowLength = buffer.rowLength;
	if (buffer.rowLength == 1 && buffer.rows(0) == '') {
		rowLength = 0;
	}

	if (isNew) {
		result.push(_('New file'));
	}
	else {
		result.push(_('{0} {line:0}, {1} {character:1}.', rowLength, charLength));
	}

	return result.join(' ');
}
function getFileInfo () {
	var result = [];
	var attribs = [];

	// file name
	result.push('"' + getFileNameString() + '"');

	// attributes
	attribs.push(getNewlineType(preferredNewline)); // newline type
	config.vars.modified && attribs.push(_('modified')); // modified
	config.vars.readonly && attribs.push(_('readonly')); // read only
	result.push('[' + attribs.join(', ') + ']');

	// current line number
	result.push(getCaretPositionString());

	return result.join(' ');
}
function getLogicalColumn () {
	var line = buffer.rows(buffer.selectionStartRow).substr(0, buffer.selectionStartCol);
	var textspan = $('wasavi_singleline_scaler');
	if (textspan.textContent != line) {
		textspan.textContent = line;
	}
	// TODO: use more trustworthy method
	return Math.floor(textspan.offsetWidth / charWidth + 0.5);
}
function fireEvent (eventName, payload) {
	if (!extensionChannel) return;
	payload || (payload = {});
	payload.type = 'wasavi-' + eventName;
	var message = {type:'notify-to-parent', payload:payload};
	if ('parentTabId' in targetElement) {
		message.parentTabId = targetElement.parentTabId;
	}
	extensionChannel.postMessage(message);
}
function fireNotifyKeydownEvent (code, key, note) {
	if (!testMode) return;
	fireEvent('notify-keydown', {
		keyCode:code,
		key:key,
		eventType:note
	});
}
function fireCommandCompleteEvent (eventName) {
	if (!testMode) return;
	eventName || (eventName = 'command-completed');
	var pt = new Position(getCurrentViewPositionIndices().top, 0);
	fireEvent(eventName, {
		state:{
			running:    !!targetElement,
			state:      state,
			inputMode:  inputMode,
			lastMessage:lastMessage,
			lastSimpleCommand: lastSimpleCommand,
			value:      buffer.value,
			row:        buffer.selectionStartRow,
			col:        buffer.selectionStartCol,
			topRow:     pt.row,
			topCol:     pt.col,
			rowLength:  buffer.elm.childNodes.length,
			registers:  registers.dumpData(),
			marks:      marks.dumpData(),
			lines:      config.vars.lines
		}
	});
}
function setSubstituteWorker (obj) {
	if (!(obj instanceof Wasavi.SubstituteWorker)) {
		throw new Error('invalid object assigning as SubstituteWorker');
	}
	substituteWorker = obj;
}

/*
 * low-level functions for editor functionality {{{1
 * ----------------
 */

function execMap (target, e, map, key, subkey, code, pos) {
	if (map[key]) {
		subkey || (subkey = '');
		var opts = {
			target:target,
			e:e,
			key:key,
			subkey:subkey,
			selectionStart:pos && pos.s || buffer.selectionStart,
			selectionEnd:pos && pos.e || buffer.selectionEnd
		};
		switch (typeof map[key]) {
		case 'function':
			if (subkey == '' || subkey == inputMode) {
				return map[key].call(map, keyManager.code2letter(code) || code, opts);
			}
			break;
		case 'object':
			if (subkey != '' && subkey in map[key]) {
				return map[key][subkey].call(map, keyManager.code2letter(code) || code, opts);
			}
			break;
		}
		return true;
	}
	return false;
}
function refreshIdealWidthPixels () {
	if (idealWidthPixels < 0) {
		var n = buffer.selectionStart;
		var line = buffer.rows(n).substr(0, n.col);
		var textspan = $('wasavi_singleline_scaler');
		if (textspan.textContent != line) {
			textspan.textContent = line;
		}
		idealWidthPixels = textspan.offsetWidth;

		var curRectTop = buffer.rowNodes(n).getBoundingClientRect();
		var curRect = buffer.charRectAt(n);
		idealDenotativeWidthPixels = curRect.left - curRectTop.left + parseInt((curRect.right - curRect.left) / 2);
	}
}
function getCurrentViewPositionIndices () {
	function findTopLineIndex (line) {
		var low = 0;
		var high = buffer.elm.childNodes.length - 1;
		var result = -1;
		while (low <= high) {
			var middle = parseInt((low + high) / 2);
			var node = buffer.elm.childNodes[middle];
			var top = node.offsetTop;
			var bottom = node.offsetTop + node.offsetHeight
			if (top == line && line < bottom) {
				result = middle;
				break;
			}
			else if (top < line && line < bottom) {
				result = middle + 1;
				break;
			}
			else if (bottom <= line) {
				low = middle + 1;
			}
			else {
				high = middle - 1;
			}
		}
		return result;
	}
	function findBottomLineIndex (line) {
		var low = 0;
		var high = buffer.elm.childNodes.length - 1;
		var result = -1;
		while (low <= high) {
			var middle = parseInt((low + high) / 2);
			var node = buffer.elm.childNodes[middle];
			var top = node.offsetTop;
			var bottom = node.offsetTop + node.offsetHeight
			if (top < line && line == bottom) {
				result = middle;
				break;
			}
			else if (top < line && line < bottom) {
				result = middle - 1;
				break;
			}
			else if (bottom <= line) {
				low = middle + 1;
			}
			else {
				high = middle - 1;
			}
		}
		return result;
	}

	var result = {};

	var top = findTopLineIndex(buffer.elm.scrollTop);
	if (top >= 0) {
		result.top = top;
	}
	else {
		result.top = 0;
	}

	var bottom = findBottomLineIndex(buffer.elm.scrollTop + buffer.elm.clientHeight - 1);
	if (bottom >= 0) {
		result.bottom = bottom;
	}
	else {
		result.bottom = buffer.rowLength - 1;
	}

	result.lines = parseInt(buffer.elm.clientHeight / lineHeight);

	return result;
}
function isDenotativeState () {
	var isAlterMotion = prefixInput.motion.charAt(0) == 'g';
	return isAlterMotion  && !config.vars.jkdenotative
		|| !isAlterMotion &&  config.vars.jkdenotative;
}
function callDenotativeFunction () {
	return (isDenotativeState() ? motionUpDownDenotative : motionUpDown).apply(null, arguments);
}
function inputEscape () {
	if (arguments.length) {
		requestRegisterNotice(_('{0} canceled.', prefixInput.operation || arguments[0]));
	}
	else {
		inputMode == 'command' && requestRegisterNotice(_('In command mode.'));
	}

	prefixInput.reset();
	requestShowPrefixInput();
	return false;
}
function inputDigit (c) {
	prefixInput.appendCount(c);
	requestShowPrefixInput();
	return false;
}
function operationDefault (c, o) {
	if (prefixInput.isEmptyOperation) {
		prefixInput.operation = c;
		requestShowPrefixInput();
	}
	else if (prefixInput.operation == c) {
		return true;
	}
	else {
		inputEscape(o.e.fullIdentifier);
	}
	return false;
}

/*
 * low-level functions for cursor motion {{{1
 * ----------------
 */

function motionLeft (c, count) {
	count || (count = 1);
	var n = buffer.selectionStart;
	n.col <= 0 && requestRegisterNotice(_('Top of line.'));
	n.col = Math.max(n.col - count, 0);
	buffer.selectionStart = n;
	prefixInput.motion = c;
	idealWidthPixels = -1;
	return true;
}
function motionRight (c, count) {
	count || (count = 1);
	var n = buffer.selectionEnd;
	var length = buffer.rows(n).length;
	n.col >= length - 1 && requestRegisterNotice(_('Tail of line.'));
	n.col = Math.min(n.col + count, length);
	buffer.selectionEnd = n;
	prefixInput.motion = c;
	idealWidthPixels = -1;
	return true;
}
function motionLineStart (c, realTop) {
	buffer.selectionStart = realTop ?
		buffer.getLineTopOffset(buffer.selectionStart) :
		buffer.getLineTopOffset2(buffer.selectionStart);
	prefixInput.motion = c;
	idealWidthPixels = -1;
	return true;
}
function motionLineEnd (c) {
	buffer.selectionEnd = buffer.getLineTailOffset(buffer.selectionEnd);
	prefixInput.motion = c;
	idealWidthPixels = -1;
	return true;
}
function motionLineStartDenotative (c, realTop) {
	var n = buffer.getLineTopDenotativeOffset(buffer.selectionStart);
	if (!realTop) {
		while (!buffer.isEndOfText(n) && !buffer.isNewline(n) && /[ \t]/.test(buffer.charAt(n))) {
			n.col++;
		}
	}
	buffer.selectionStart = n;
	prefixInput.motion = c;
	idealWidthPixels = -1;
	return true;
}
function motionLineEndDenotative (c) {
	var n = buffer.getLineTailDenotativeOffset(buffer.selectionEnd);
	buffer.selectionEnd = n;
	prefixInput.motion = c;
	idealWidthPixels = -1;
	return true;
}
function motionNextWord (c, count, bigWord, wordEnd) {
	var n = buffer.selectionEnd;
	count || (count = 1);
	n.col >= buffer.rows(n).length - 1 && n.row >= buffer.rowLength - 1 && requestRegisterNotice(_('Tail of text.'));

	function doBigWord () {
		for (var i = 0; i < count; i++) {
			var prop = buffer.charClassAt(n, true);
			var foundSpace = prop === 'Z';

			while (!buffer.isEndOfText(n)) {
				if (buffer.isNewline(n)) {
					if (!prefixInput.isEmptyOperation && i + 1 == count) {
						break;
					}
					var tmp = buffer.rightPos(n);
					if (buffer.isNewline(tmp)) {
						n = tmp;
						break;
					}
				}

				n = buffer.rightPos(n);

				var nextprop = buffer.charClassAt(n, true);
				if (nextprop === 'Z' && !foundSpace) {
					foundSpace = true;
				}
				else if (nextprop !== 'Z' && foundSpace) {
					break;
				}
			}
		}
	}

	function doWord () {
		for (var i = 0; i < count; i++) {
			var prop = buffer.charClassAt(n, true);

			while (!buffer.isEndOfText(n)) {
				if (buffer.isNewline(n)) {
					if (!prefixInput.isEmptyOperation && i + 1 == count) {
						break;
					}
					var tmp = buffer.rightPos(n);
					if (buffer.isNewline(tmp)) {
						n = tmp;
						break;
					}
				}

				n = buffer.rightPos(n);

				var nextprop = buffer.charClassAt(n, true);
				if (prop !== nextprop && nextprop !== 'Z') {
					break;
				}
				prop = nextprop;
			}
		}
	}

	function doBigWordEnd () {
		for (var i = 0; i < count; i++) {
			var prop = buffer.charClassAt(n, true);
			var startn = n;

			while (!buffer.isEndOfText(n)) {
				var prevn = n;
				n = buffer.rightPos(n);

				var nextprop = buffer.charClassAt(n, true);
				if (prop !== nextprop && nextprop === 'Z' && buffer.getSelection(startn, n).length > 1) {
					n = prevn;
					break;
				}

				if (buffer.isNewline(n)) {
					var tmp = buffer.rightPos(n);
					if (buffer.isNewline(tmp)) {
						n = tmp;
						break;
					}
				}

				prop = nextprop;
			}
		}
	}

	function doWordEnd () {
		for (var i = 0; i < count; i++) {
			var prop = buffer.charClassAt(n, true);
			var startn = n;

			while (!buffer.isEndOfText(n)) {
				var prevn = n;
				n = buffer.rightPos(n);

				var nextprop = buffer.charClassAt(n, true);
				if (prop !== nextprop && prop !== 'Z' && buffer.getSelection(startn, n).length > 1) {
					n = prevn;
					break;
				}

				if (buffer.isNewline(n)) {
					var tmp = buffer.rightPos(n);
					if (buffer.isNewline(tmp)) {
						n = tmp;
						break;
					}
				}

				prop = nextprop;
			}
		}
	}

	if (prefixInput.isEmptyOperation || !buffer.isNewline(n)) {
		if (bigWord) {
			wordEnd ? doBigWordEnd() : doBigWord();
		}
		else {
			wordEnd ? doWordEnd() : doWord();
		}
	}

	buffer.selectionEnd = n;
	prefixInput.motion = c;
	idealWidthPixels = -1;
	return true;
}
function motionPrevWord (c, count, bigWord, specialStops) {
	var n = buffer.selectionStart;
	count || (count = 1);
	n.col <= 0 && n.row <= 0 && requestRegisterNotice(_('Top of text.'));

	function isStopPosition (stop) {return stop.eq(n);}

	if (specialStops && !(specialStops instanceof Array)) {
		specialStops = [specialStops];
	}
	if (bigWord) {
		for (var i = 0; i < count; i++) {
			n = buffer.leftPos(n);
			var prop = buffer.charClassAt(n, true);
			var nonSpaceFound = prop !== 'Z';

			while (n.row > 0 || n.col > 0) {
				if (buffer.isNewline(n) && buffer.isNewline(buffer.leftPos(n))) {break;}
				if (specialStops && specialStops.some(isStopPosition)) {break;}

				var prevn = n;
				n = buffer.leftPos(n);
				if (n.eq(prevn)) {break;}

				var nextprop = buffer.charClassAt(n, true);
				if (nextprop !== 'Z' && !nonSpaceFound) {
					nonSpaceFound = true;
				}
				else if (nextprop === 'Z' && nonSpaceFound) {
					n = prevn;
					break;
				}
				prop = nextprop;
			}
		}
	}
	else {
		for (var i = 0; i < count; i++) {
			n = buffer.leftPos(n);
			var prop = buffer.charClassAt(n, true);
			var nonSpaceFound = prop !== 'Z';

			while (n.row > 0 || n.col > 0) {
				if (buffer.isNewline(n) && buffer.isNewline(buffer.leftPos(n))) {break;}
				if (specialStops && specialStops.some(isStopPosition)) {break;}

				var prevn = n;
				n = buffer.leftPos(n);
				if (n.eq(prevn)) {break;}

				var nextprop = buffer.charClassAt(n, true);
				if (nextprop !== 'Z' && !nonSpaceFound) {
					nonSpaceFound = true;
				}
				else if (prop !== nextprop) {
					n = prevn;
					break;
				}
				prop = nextprop;
			}
		}
	}

	buffer.selectionStart = n;
	prefixInput.motion = c;
	idealWidthPixels = -1;
	return true;
}
function motionFindForward (c, count, stopBefore, continuous) {
	var n = buffer.selectionEnd;
	count || (count = 1);

	function indexOfEx (line, target, start) {
		var index = start || 0;
		var goal = line.length;
		while (index < goal) {
			var c = line.charAt(index);
			if (c == target || ffttDictionary.match(c, target)) {
				return index;
			}
			index++;
		}
		return -1;
	}

	var startn = n.clone();
	var found = true;
	var line = buffer.rows(n);
	for (var i = 0; i < count; i++) {
		var index = indexOfEx(line, c, n.col + 1);
		if (index >= 0) {
			n.col = index;
			if (stopBefore
			&&  continuous
			&&  i == count - 1
			&&  startn.eq(new Position(n.row, n.col - 1))) {
				count++;
			}
		}
		else {
			found = false;
			break;
		}
	}
	if (found) {
		if (stopBefore) {
			n.col--;
		}
		buffer.selectionEnd = n;
	}
	else {
		requestRegisterNotice(_('Next search target not found.'));
	}
	lastHorzFindCommand.direction = 1;
	lastHorzFindCommand.letter = c;
	lastHorzFindCommand.stopBefore = stopBefore;
	idealWidthPixels = -1;
	return true;
}
function motionFindBackward (c, count, stopBefore, continuous) {
	var n = buffer.selectionStart;
	count || (count = 1);

	function lastIndexOfEx (line, target, start) {
		var index = start || 0;
		while (index >= 0) {
			var c = line.charAt(index);
			if (c == target || ffttDictionary.match(c, target)) {
				return index;
			}
			index--;
		}
		return -1;
	}

	var startn = n.clone();
	var found = true;
	var line = buffer.rows(n);
	for (var i = 0; i < count; i++) {
		var index = lastIndexOfEx(line, c, n.col - 1);
		if (index >= 0) {
			n.col = index;
			if (stopBefore
			&&  continuous
			&&  i == count - 1
			&&  startn.eq(new Position(n.row, n.col + 1))) {
				count++;
			}
		}
		else {
			found = false;
			break;
		}
	}
	if (found) {
		if (stopBefore) {
			n.col++;
		}
		buffer.selectionStart = n;
	}
	else {
		requestRegisterNotice(_('Previous search target not found.'));
	}
	lastHorzFindCommand.direction = -1;
	lastHorzFindCommand.letter = c;
	lastHorzFindCommand.stopBefore = stopBefore;
	idealWidthPixels = -1;
	return true;
}
function motionFindByRegexFacade (pattern, count, direction, verticalOffset) {
	var result;
	switch (direction) {
	case -1:
		result = motionFindByRegexBackward(pattern, count);
		break;
	case 1:
		result = motionFindByRegexForward(pattern, count);
		break;
	default:
		return false;
	}

	if (result) {
		buffer.extendSelectionTo(result.offset);

		if (verticalOffset != undefined) {
			switch (direction) {
			case -1:
				var n = buffer.selectionStart;
				n.row = Math.max(0, Math.min(n.row + verticalOffset, buffer.rowLength - 1));
				buffer.selectionStart = buffer.getLineTopOffset2(n);
				break;
			case 1:
				var n = buffer.selectionEnd;
				n.row = Math.max(0, Math.min(n.row + verticalOffset, buffer.rowLength - 1));
				buffer.selectionEnd = buffer.getLineTopOffset2(n);
				break;
			}
			isVerticalMotion = true;
		}
	}
	else {
		prefixInput.reset();
		requestShowMessage(_('Pattern not found: {0}', pattern), true);
	}
	return true;
}
function motionFindByRegexForward (c, count, opts) {
	count || (count = 1);
	opts || (opts = regexConverter.getDefaultOption());
	var text = lastRegexFindCommand.text;
	var n = buffer.binaryPositionToLinearPosition(buffer.selectionEnd);
	var startn = n;
	var len = 0;
	var regex = getFindRegex(c);
	var wrapped = false;
	var re;
	if (typeof text != 'string') {
		lastRegexFindCommand.text = text = buffer.value;
	}
	if (regex && regex.source.length) {
		regex.lastIndex = opts.includeCurrentChar ? n : n + 1;
		for (var i = 0; i < count; i++) {
			var loop;
			do {
				loop = false;
				re = regex.exec(text);
				if (re) {
					var newn = regex.lastIndex - re[0].length;
					if (text.charAt(newn) == '\n' && newn - 1 == startn) {
						loop = true;
					}
					else {
						n = newn;
						len = re[0].length;
					}
				}
				else {
					if (opts.wrapscan && !wrapped) {
						wrapped = true;
						regex.lastIndex = 0;
						loop = true;
					}
					else {
						return null;
					}
				}
			} while (loop);
		}
	}
	idealWidthPixels = -1;
	wrapped && requestShowMessage(_('Search wrapped.'), false, false, true);
	return {offset:n, matchLength:len};
}
function motionFindByRegexBackward (c, count, opts) {
	count || (count = 1);
	opts || (opts = regexConverter.getDefaultOption());
	var text = lastRegexFindCommand.text;
	var n = buffer.binaryPositionToLinearPosition(buffer.selectionStart);
	var len = 0;
	var regex = getFindRegex(c);
	var wrapped = false;
	function getLineTop (n) {
		while (--n >= 0 && text.charCodeAt(n) != 0x0a) {}
		n++;
		return n;
	}
	function leftPos (n) {
		if (n <= 0) return 0;
		n--;
		if (text.charCodeAt(n) == 0x0a) {n--;}
		return n;
	}
	function doBackSearch () {
		var result = false;
		while (true) {
			var re;
			var foundAt = -1;
			while ((re = regex.exec(text)) && regex.lastIndex - re[0].length < n) {
				len = re[0].length;
				foundAt = regex.lastIndex - len;
				if (len == 0) {
					regex.lastIndex++;
				}
			}
			if (foundAt >= 0) {
				n = foundAt;
				result = n < startn;
				regex.lastIndex = linetop;
				break;
			}
			else {
				var tmp = getLineTop(leftPos(linetop));
				if (tmp >= linetop) {
					break;
				}
				else {
					n = linetop;
					linetop = tmp;
					regex.lastIndex = linetop;
				}
			}
		}
		return result;
	}
	if (typeof text != 'string') {
		lastRegexFindCommand.text = text = buffer.value;
	}
	if (regex && regex.source.length) {
		var startn = n;
		var linetop = getLineTop(n);
		regex.lastIndex = linetop;
		for (var i = 0; i < count; i++) {
			var loop;
			do {
				loop = false;
				if (!doBackSearch()) {
					if (opts.wrapscan && !wrapped) {
						wrapped = true;
						startn = n = text.length;
						linetop = getLineTop(n);
						regex.lastIndex = linetop;
						loop = true;
					}
					else {
						return null;
					}
				}
			} while (loop);
		}
	}
	idealWidthPixels = -1;
	wrapped && requestShowMessage(_('Search wrapped.'), false, false, true);
	return {offset:n, matchLength:len};
}
function motionReplaceOne (c, count) {
	count || (count = 1);

	var done = false;
	var n = buffer.selectionStart;
	if (!buffer.selected) {
		if (count <= buffer.getLineTailOffset(n).col - n.col) {
			if (c == '\r' || c == '\n') {
				buffer.selectionEnd = new Position(n.row, n.col + count);
				insert('\n' + buffer.getIndent(n));
			}
			else {
				buffer.selectionEnd = new Position(n.row, n.col + count);
				insert(multiply(c, count));
			}
			done = true;
		}
		else {
			requestRegisterNotice(_('Replace count too large.'));
		}
	}
	else {
		insert(multiply(c, buffer.getSelection(n, buffer.selectionEnd).length));
		done = true;
	}

	if (done) {
		n = buffer.selectionStart;
		n.col = Math.max(n.col - 1, 0);
		buffer.setSelectionRange(n);
	}

	isEditCompleted = true;
	prefixInput.motion = c;
	idealWidthPixels = -1;
	return true;
}
function motionUpDown (c, count, isDown) {
	count || (count = 1);
	refreshIdealWidthPixels();
	var textspan = $('wasavi_singleline_scaler');
	var n = isDown ? buffer.selectionEnd : buffer.selectionStart;
	var goalWidth = idealWidthPixels;

	if (isDown) {
		n.row >= buffer.rowLength - 1 && requestRegisterNotice(_('Tail of text.'));
		n.row = Math.min(n.row + count, buffer.rowLength - 1);
	}
	else {
		n.row <= 0 && requestRegisterNotice(_('Top of text.'));
		n.row = Math.max(n.row - count, 0);
	}

	var width = 0;
	var widthp = 0;
	var line = buffer.rows(n);
	var index = 0;

	textspan.textContent = '';

	while (index < line.length && !buffer.isNewline(n.row, index)) {
		// TODO: more optimization
		textspan.textContent += line.substr(index++, 1);
		width = textspan.offsetWidth;
		if (width >= goalWidth) {
			index -= Math.abs(widthp - goalWidth) < Math.abs(width - goalWidth) ? 1 : 0;
			break;
		}
		widthp = width;
	}
	n.col = index;
	if (isDown) {
		buffer.selectionEnd = n;
	}
	else {
		buffer.selectionStart = n;
	}
	prefixInput.motion = c;
	isVerticalMotion = true;
	return true;
}
function motionUp (c, count) {
	return motionUpDown(c, count, false);
}
function motionDown (c, count) {
	return motionUpDown(c, count, true);
}
function motionUpDownDenotative (c, count, isDown) {
	count || (count = 1);
	refreshIdealWidthPixels();
	var n = isDown ? buffer.selectionEnd : buffer.selectionStart;
	var goalWidth = idealDenotativeWidthPixels;
	var overed = false;
	var dir = isDown ? 1 : -1;

	for (var i = 0; i < count; i++) {
		var curRect = buffer.charRectAt(n);
		var startn = n.clone();
		while (isDown && !buffer.isEndOfText(n) && !buffer.isNewline(n) && ++n.col >= 0
		|| !isDown && --n.col >= 0) {
			// TODO: more optimization
			var newRect = buffer.charRectAt(n);
			if (isDown && newRect.top > curRect.top
			||  !isDown && newRect.top < curRect.top) break;
		}
		if (isDown && buffer.isNewline(n) || !isDown && n.col < 0) {
			if (isDown && n.row >= buffer.rowLength - 1 || !isDown && n.row <= 0) {
				overed = i == 0;
				n = startn;
				break;
			}
			n.row += dir;
			n.col = isDown ? 0 : Math.max(buffer.rows(n).length - 1, 0);
		}

		var curRectTop = buffer.rowNodes(n).getBoundingClientRect();
		var widthp = 0;
		while (isDown && !buffer.isEndOfText(n) && !buffer.isNewline(n)
		|| !isDown && n.col >= 0) {
			// TODO: more optimization
			var newRect = buffer.charRectAt(n);
			var width = newRect.left - curRectTop.left + parseInt((newRect.right - newRect.left) / 2);
			if (isDown && width >= goalWidth || !isDown && width <= goalWidth) {
				var closer = Math.abs(widthp - goalWidth) < Math.abs(width - goalWidth) ? 1 : 0;
				n.col += closer * -dir;
				break;
			}
			widthp = width;
			n.col += dir
		}
	}

	n.col = Math.max(0, Math.min(n.col, buffer.rows(n).length));
	if (isDown) {
		buffer.selectionEnd = n;
	}
	else {
		buffer.selectionStart = n;
	}
	prefixInput.motion = c;
	overed && requestRegisterNotice(isDown ? _('Tail of text.') : _('Top of text.'));
	return true;
}
function scrollView (c, count) {
	function down (count) {
		var index = Math.min(v.top + count, buffer.rowLength - 1);
		var dest = index == 0 ? 0 : buffer.rowNodes(index).offsetTop;
		scroller.run(dest, function () {
			var v2 = getCurrentViewPositionIndices();
			if (v2.top >= 0 && v2.top < buffer.rowLength && v2.top > buffer.selectionStartRow) {
				buffer.setSelectionRange(buffer.getLineTopOffset2(v2.top, 0));
			}
		});
	}
	function up (count) {
		var index = Math.max(v.top - count, 0);
		var dest = index == 0 ? 0 : buffer.rowNodes(index).offsetTop;
		scroller.run(dest, function () {
			var v2 = getCurrentViewPositionIndices();
			if (v2.bottom >= 0 && v2.bottom < buffer.rowLength && v2.bottom < buffer.selectionStartRow) {
				buffer.setSelectionRange(buffer.getLineTopOffset2(v2.bottom, 0));
			}
		});
	}
	var v = getCurrentViewPositionIndices();
	if (typeof count == 'function') {
		count = count(v);
	}
	if (typeof count == 'number' && !isNaN(count) && count != 0) {
		count > 0 ? down(count) : up(-count);
	}
	prefixInput.motion = c;
	return true;
}
function extendRightIfInclusiveMotion () {
	if (prefixInput.motion == ';' && lastHorzFindCommand.direction == 1
	||  prefixInput.motion == ',' && lastHorzFindCommand.direction == -1
	||  'eEft%'.indexOf(prefixInput.motion) >= 0) {
		if (!buffer.isNewline(buffer.selectionEnd)) {
			buffer.selectionEnd = buffer.rightPos(buffer.selectionEnd);
		}
	}
}
function clipOverrun () {
	if (inputMode != 'edit-overwrite') {
		return false;
	}
	var p = inputHandler.getStartPosition();
	var n = buffer.selectionStart;
	if (n.lt(p)) {
		buffer.setSelectionRange(p);
		requestShowMessage(_('You are in the restricted region.'), true);
		return true;
	}
	return false;
}
function adjustDeleteOperationPos (isLineOrient, actualCount) {
	// special delete behavior followed vim.
	if (!isLineOrient && buffer.selectionEndCol == 0 && actualCount > 1) {
		var leading = buffer.rows(buffer.selectionStartRow)
			.substring(0, buffer.selectionStartCol);
		if (!/\S/.test(leading)) {
			isLineOrient = true;
		}

		actualCount--;
		buffer.selectionEnd = buffer.leftPos(buffer.selectionEnd);
	}
	return {
		isLineOrient:isLineOrient,
		actualCount:actualCount
	};
}

/*
 * low-level functions for text modification {{{1
 * ----------------
 */

function deleteSelection (isSubseq) {
	if (!buffer.selected && !buffer.isLineOrientSelection) return 0;

	var result = 0;
	(isSubseq ? $call : editLogger.open).call(editLogger, 'deleteSelection', function () {
		marks.update(buffer.selectionStart, function (foldedMarkRegisterer) {
			result = buffer.deleteRange(function (content, fragment) {
				var deleteMarks = fragment.querySelectorAll('span.' + MARK_CLASS);
				var deleteMarksDest = {};
				for (var i = 0; i < deleteMarks.length; i++) {
					var name = deleteMarks[i].getAttribute('data-index');
					var position = marks.get(name);
					position && (deleteMarksDest[name] = position.clone());
				}
				!buffer.isLineOrientSelection && foldedMarkRegisterer(fragment);
				editLogger.write(
					Wasavi.EditLogger.ITEM_TYPE.DELETE,
					buffer.selectionStart, content,
					buffer.selectionEnd, buffer.isLineOrientSelection,
					buffer.selectionEndRow == buffer.rowLength - 1 && buffer.selectionEndCol > 0,
					deleteMarksDest
				);
			});
		});
	});
	return result;
}
function insert (s, opts) {
	if (s == '' && !buffer.selected) return;

	opts || (opts = {});
	var keepPosition = !!opts.keepPosition;
	var isLineOrientedLast = !!opts.isLineOrientedLast;
	var isEditing_ = isEditing();

	(isEditing_ ? $call : editLogger.open).call(editLogger, 'insert', function () {
		deleteSelection();

		var startn = buffer.selectionStart;
		if (isLineOrientedLast
		&& s.length >= 2
		&& s.substr(-1) == '\n'
		&& buffer.selectionStartRow == buffer.rowLength - 1
		&& buffer.rowTextNodes(buffer.selectionStartRow).nodeValue.substring(buffer.selectionStartCol) == '\n') {
			s = s.substr(0, s.length - 1);
		}
		var re = s.match(/\u0008|\u007f|\n|[^\u0008\u007f\n]+/g);
		if (!re) return;

		for (var i = 0; i < re.length; i++) {
			switch (re[i]) {
			case '\u0008':
				deleteCharsBackward(1, {isSubseq:true});
				break;
			case '\u007f':
				deleteCharsForward(1, {isSubseq:true});
				break;
			case '\n':
				!isEditing_ && editLogger.write(
					Wasavi.EditLogger.ITEM_TYPE.INSERT,
					buffer.selectionStart, re[i], keepPosition
				);
				marks.update(buffer.selectionStart, function () {
					isMultilineTextInput(targetElement) && buffer.divideLine();
				});
				break;
			default:
				!isEditing_ && editLogger.write(
					Wasavi.EditLogger.ITEM_TYPE.INSERT,
					buffer.selectionStart, re[i], keepPosition
				);
				marks.update(buffer.selectionStart, function () {
					buffer.setSelectionRange(buffer.insertChars(buffer.selectionStart, re[i]));
				});
				break;
			}
		}
		keepPosition && buffer.setSelectionRange(startn);
	});
}
function overwrite (s, opts) {
	if (s == '') return;

	opts || (opts = {});
	var keepPosition = !!opts.keepPosition;
	var isLineOrientedLast = !!opts.isLineOrientedLast;

	inputHandler.updateOverwritten();

	(isEditing() ? $call : editLogger.open).call(editLogger, 'overwrite', function () {
		deleteSelection();

		var startn = buffer.selectionStart;
		!isEditing() && editLogger.write(
			Wasavi.EditLogger.ITEM_TYPE.OVERWRITE,
			startn, s, buffer.rows(startn)
		);
		marks.update(startn, function () {
			var re = s.match(/\n|[^\n]+/g);
			if (!re) return;
			for (var i = 0; i < re.length; i++) {
				switch (re[i]) {
				case '\n':
					isMultilineTextInput(targetElement) && buffer.divideLine();
					break;

				default:
					buffer.setSelectionRange(buffer.overwriteChars(buffer.selectionStart, re[i]));
					break;
				}
			}
			isEditCompleted = true;
		});
		keepPosition && buffer.setSelectionRange(startn);
	});
}
function shift (rowCount, shiftCount) {
	rowCount || (rowCount = 1);
	shiftCount || (shiftCount = 1);
	editLogger.open('shift', function () {
		var startn = buffer.selectionStart;
		editLogger.write(
			Wasavi.EditLogger.ITEM_TYPE.SHIFT, startn, '', rowCount, shiftCount,
			config.vars.shiftwidth, config.vars.tabstop
		);
		marks.update(startn, function () {
			buffer.shift(
				startn.row, rowCount, shiftCount,
				config.vars.shiftwidth, config.vars.tabstop
			);
		});
		if (rowCount >= config.vars.report) {
			requestShowMessage(_('Shifted {0} {line:0}.', rowCount));
		}
	});
	isEditCompleted = true;
}
function unshift (rowCount, shiftCount) {
	rowCount || (rowCount = 1);
	shiftCount || (shiftCount = 1);
	editLogger.open('unshift', function () {
		var startn = buffer.selectionStart;
		var editLogItem = editLogger.write(
			Wasavi.EditLogger.ITEM_TYPE.UNSHIFT, startn, '', rowCount, shiftCount,
			config.vars.shiftwidth, config.vars.tabstop
		);
		marks.update(startn, function () {
			editLogItem.indents = buffer.shift(
				startn.row, rowCount, -shiftCount,
				config.vars.shiftwidth, config.vars.tabstop
			);
		});
		if (rowCount >= config.vars.report) {
			requestShowMessage(_('Unshifted {0} {line:0}.', rowCount));
		}
	});
	isEditCompleted = true;
}
function reformat () {
	var curpos = buffer.selectionStart;
	config.vars.textwidth > 0 && editLogger.open('reformat', function () {
		var seMark = 'reformat-end';
		var nextMark = 'reformat-next';
		var limitWidth = charWidth * config.vars.textwidth;
		var scaler = $('wasavi_singleline_scaler');
		var isEnd = false;
		marks.setPrivate(seMark, buffer.getLineTailOffset(buffer.selectionEnd));

		function doReformat () {
			while (true) {
				var line = buffer.rows(buffer.selectionStartRow);
				var overed = false;
				var breakItem = false;
				var lastIndex = 0;

				scaler.textContent = '';
				var lb = lineBreaker.run(line, function (item) {
					if (!item) return false;
					scaler.textContent += line.substring(lastIndex, item.index + item.length);
					lastIndex = item.index + item.length;
					if (item.codePoint != 32 && item.codePoint != 9
					&& scaler.offsetWidth > limitWidth) {
						overed = true;
					}
					else if (unicodeUtils.canBreak(item.breakAction)) {
						breakItem = item;
					}
					return overed && !!breakItem;
				});
				if (!overed || !breakItem) break;
				buffer.setSelectionRange(new Position(
					buffer.selectionStartRow, breakItem.index + breakItem.length));

				var n = buffer.selectionStart;
				while (n.col > 0) {
					var left = buffer.leftPos(n);
					if (!/[ \t]/.test(buffer.charAt(left))) {
						break;
					}
					n = left;
				}
				if (n.lt(buffer.selectionEnd)) {
					buffer.selectionStart = n;
					deleteSelection();
				}
				var newlineObj = keyManager.objectFromCode(0x000d);
				execMap(buffer, newlineObj, editMap, '\u000d', '', '\u000d');
			}
		}

		while (!isEnd && curpos.row < buffer.rowLength) {
			if (/^[ \t]*$/.test(buffer.rows(curpos))) {
				curpos.row++;
				continue;
			}

			buffer.setSelectionRange(curpos);

			var paraTail = searchUtils.findParagraphBoundary(1, true, true);
			if (paraTail.row >= buffer.rowLength - 1) {
				isEnd = true;
				paraTail.row = buffer.rowLength - 1;
			}
			if (paraTail.row >= marks.getPrivate(seMark).row) {
				isEnd = true;
				paraTail.row = marks.getPrivate(seMark).row;
			}
			while (/^[ \t]*$/.test(buffer.rows(paraTail.row))) {
				paraTail.row--;
			}
			if (paraTail.row < curpos.row) {
				break;
			}

			marks.setPrivate(nextMark, buffer.getLineTailOffset(paraTail));
			paraTail.row > curpos.row && joinLines(paraTail.row - curpos.row);
			doReformat();
			curpos = marks.getPrivate(nextMark);
			curpos.row++;
		}

		marks.setPrivate(seMark);
		marks.setPrivate(nextMark);
	});
	isEditCompleted = true;
	idealWidthPixels = -1;
	if (curpos.row >= buffer.rowLength) {
		curpos.row = buffer.rowLength - 1;
		curpos = buffer.getLineTailOffset(curpos);
	}
	else {
		curpos = buffer.getLineTopOffset2(curpos);
	}
	return curpos;
}
function deleteChars (count, isForward, isSubseq, withYank, canJoin) {
	if (buffer.selected) {
		deleteSelection(isSubseq);
	}
	else {
		count || (count = 1);

		if (isForward) {
			var n = buffer.selectionEnd;
			var tail = buffer.getLineTailOffset(n);
			if (n.col < tail.col) {
				n.col = Math.min(tail.col, n.col + count);
				buffer.selectionEnd = n;
				withYank && yank();
				deleteSelection(isSubseq);
			}
			else if (canJoin && n.col >= tail.col && n.row < buffer.rowLength - 1) {
				n.row++;
				n.col = 0;
				buffer.selectionEnd = n;
				deleteSelection(isSubseq);
			}
		}
		else {
			var n = buffer.selectionStart;
			if (n.col > 0) {
				n.col = Math.max(0, n.col - count);
				buffer.selectionStart = n;
				withYank && yank();
				deleteSelection(isSubseq);
			}
			else if (canJoin && n.col == 0 && n.row > 0) {
				n.row--;
				n.col = buffer.rows(n).length;
				buffer.selectionStart = n;
				deleteSelection(isSubseq);
			}
		}
	}
	isEditCompleted = true;
	return true;
}
function deleteCharsForward (count, opts) {
	opts || (opts = {});
	return deleteChars(count, true, !!opts.isSubseq, !!opts.yank, !!opts.canJoin);
}
function deleteCharsBackward (count, opts) {
	opts || (opts = {});
	return deleteChars(count, false, !!opts.isSubseq, !!opts.yank, !!opts.canJoin);
}
function joinLines (count, asis) {
	count || (count = 1);
	editLogger.open('joinLines', function () {
		var asisIndex = [{length:0}];
		for (var i = 0; i < count; i++) {
			if (buffer.selectionStartRow >= buffer.rowLength - 1) return;

			var t1 = buffer.rows(buffer.selectionStartRow);
			var t2 = buffer.rows(buffer.selectionStartRow + 1);
			var re = asis ? asisIndex : /^[ \t]*/.exec(t2);

			buffer.selectionStart = new Position(buffer.selectionStartRow, t1.length);
			buffer.selectionEnd = new Position(buffer.selectionStartRow + 1, re[0].length);
			deleteSelection();

			var t1Last = t1.substr(-1);
			var t2First = t2.charAt(re[0].length);
			if (asis || t2.length == re[0].length
			|| /[ \t]/.test(t1Last) || unicodeUtils.isIdeograph(t1Last)
			|| unicodeUtils.isClosedPunct(t2First) || unicodeUtils.isIdeograph(t2First)
			) {
				// do nothing
			}
			else if (unicodeUtils.isSTerm(t1.substr(-1))) {
				insert('  ', {keepPosition:true});
			}
			else {
				insert(' ', {keepPosition:true});
			}
		}
	});
	isEditCompleted = true;
	return true;
}
function toggleCase (count) {
	var n = buffer.selectionStart;
	var text = buffer.rows(n);
	count || (count = 1);
	count = Math.min(count, text.length - n.col);
	editLogger.open('toggleCase', function () {
		var smalla = 'a'.charCodeAt(0);
		var replacedText = text.substr(n.col, count).replace(/[a-z]/ig, function (a) {
			return a.charCodeAt(0) >= smalla ? a.toUpperCase() : a.toLowerCase();
		});
		deleteCharsForward(count);
		insert(replacedText);
	});
	isEditCompleted = true;
	return true;
}
function yank (count, isLineOrient, register) {
	var result = 0;
	if (isLineOrient || buffer.isLineOrientSelection) {
		count || (count = 1);
		result = buffer.selectRows(count);
		var content = buffer.getSelectionRows();
		registers.set(
			register == undefined ? prefixInput.register : register,
			content, true, true);
		if (result >= config.vars.report) {
			requestShowMessage(_('Yanked {0} {line:0}.', result));
		}
	}
	else {
		var content = buffer.getSelection();
		result = content.length;
		registers.set(
			register == undefined ? prefixInput.register : register,
			content, false, true);
	}
	return result;
}
function paste (count, opts) {
	count || (count = 1);
	opts || (opts = {});

	var item, data = '';
	if ('register' in opts) {
		var register = opts.register;
		if (register == undefined || register == '') {
			register = '"';
		}
		if (registers.exists(register)) {
			item = registers.get(register);
			data = item.data;
		}
		else {
			requestRegisterNotice(_('Register {0} is empty.', register));
			return true;
		}
	}
	else if ('content' in opts) {
		item = {};
		data = opts.content;
	}
	if (buffer.selected) {
		requestRegisterNotice(_('Internal state error.'));
		return true;
	}
	if (data.length == 0) {
		requestRegisterNotice(_('Putting data is empty.'));
		return true;
	}

	var isForward = !!opts.isForward;
	var isForceLineOrient = !!opts.isForceLineOrient;
	var n = buffer.selectionStart;

	if (item.isLineOrient || isForceLineOrient) {
		var originalLineOrient = item.isLineOrient;
		item.isLineOrient = true;
		if (data.substr(-1) != '\n') {
			data += '\n';
		}
		editLogger.open('paste#1', function () {
			if (isForward) {
				if (n.row >= buffer.rowLength - 1) {
					buffer.setSelectionRange(buffer.getLineTailOffset(n));
					insert('\n', {isLineOrientLast:true});
					n = buffer.selectionStart;
				}
				else {
					n.row++;
					n.col = 0;
					buffer.setSelectionRange(n);
				}
			}
			else {
				n.col = 0;
				buffer.setSelectionRange(n);
			}
			for (var i = 0, goal = count - 1; i < goal; i++) {
				insert(data);
			}
			insert(data, {isLineOrientedLast:true});
			buffer.setSelectionRange(buffer.getLineTopOffset2(n));
		});
		item.isLineOrient = originalLineOrient;
	}
	else {
		if (isForward) {
			n = buffer.rightPos(n);
			buffer.setSelectionRange(n);
		}
		editLogger.open('paste#2', function () {
			for (var i = 0; i < count; i++) {
				insert(data);
			}
		});
		if (isForward) {
			buffer.setSelectionRange(buffer.leftPos(buffer.selectionStart));
		}
	}
	isEditCompleted = true;
	return true;
}
function startEdit (c, opts) {
	if (!buffer.selected) {
		requestInputMode('edit', '', '', true);

		opts || (opts = {});
		var isAppend = !!opts.isAppend;
		var isAlter = !!opts.isAlter;
		var opened = !!opts.opened;

		var n;
		switch ((isAppend ? 2 : 0) + (isAlter ? 1 : 0)) {
		case 0:// insert
			n = buffer.selectionStart;
			break;
		case 1:// insert at top
			n = buffer.getLineTopOffset2(buffer.selectionStart);
			break;
		case 2:// append
			n = buffer.selectionEnd;
			n.col = Math.min(n.col + 1, buffer.rows(n).length);
			break;
		case 3:// append at tail
			n = buffer.getLineTailOffset(buffer.selectionEnd);
			break;
		}
		buffer.setSelectionRange(n);
		cursor.ensureVisible();
		cursor.update({type:'edit', visible:true});
		requestShowPrefixInput(getDefaultPrefixInputString());
		prefixInput.operation = c;
		prefixInput.isLocked = true;
		inputHandler.reset(opts.repeatCount, opened ? '\n' : '', buffer.selectionStart, true);
		return false;
	}
	return inputEscape(opts.e.fullIdentifier);
}
function openLine (c, after) {
	var n, isTopOfText = false;
	if (after) {
		buffer.selectionStart = n = buffer.selectionEnd;
	}
	else {
		n = buffer.getLineTopOffset(buffer.selectionStart);
		if (n.row == 0 && n.col == 0) {
			isTopOfText = true;
		}
		else {
			n = buffer.leftPos(n);
			buffer.setSelectionRange(n);
		}
	}
	editLogger.open('openLine');
	if (isTopOfText) {
		buffer.setSelectionRange(new Position(0, 0));
		insert('\n', {keepPosition:true});
	}
	else {
		var indent = config.vars.autoindent ? buffer.getIndent(buffer.selectionStart) : '';
		n = buffer.getLineTailOffset(n);
		buffer.setSelectionRange(n);
		insert('\n' + indent);
	}
	isEditCompleted = true;
	return startEdit(c, {repeatCount:prefixInput.count, opened:true});
}

/*
 * event handlers {{{1
 * ----------------
 */

// window
function handleWindowFocus (e) {
	handleCoverClick(e);
}
function handleWindowBlur (e) {
	if (quickActivation) {
		uninstall(true, true);
	}
	else {
		cursor.update({focused:false});
	}
}
function handleWindowResize (e) {
	function relocate () {
		if (targetElement) {
			targetElement.rect.width =
				document.documentElement.clientWidth;
			targetElement.rect.height =
				document.documentElement.clientHeight -
				(isStandAlone ? 0 : $('wasavi_footer').offsetHeight);
			setGeometory();
		}
		resizeHandlerInvokeTimer = null;
	}
	if (isStandAlone) {
		if (!resizeHandlerInvokeTimer) {
			resizeHandlerInvokeTimer = setTimeout(relocate, 100);
		}
	}
	else {
		relocate();
	}
}

// editor (document)
function handleKeydown2 (e) {
	if (scroller.running
	|| exCommandExecutor.running
	|| isBulkInputting && !e.isCompositioned) {
		keyManager.push(e);
		/*fireNotifyKeydownEvent(
			e.code, e.fullIdentifier,
			'busy now('
				+ (scroller.running ? 'scroller' : '')
				+ (exCommandExecutor.running ? 'exCommandExecutor' : '')
				+ (isBulkInputting && !e.isCompositioned ? 'bulk input' : '')
				+ ')'
		);*/
		return;
	}
	isInteractive = true;
	(extensionChannel && prefixInput.toString() == '"*' ? extensionChannel.getClipboard : $call)
		.call(extensionChannel, function () {
			if (recordedStrokes) {
				recordedStrokes.strokes += keyManager.toInternalString(e);
			}
			mapManager.process(e, function (code, e) {
				fireNotifyKeydownEvent(e.code, e.fullIdentifier, '');
				processInput(code, e);
			});
		});
}
function handleMousedown (e) {}
function handleMouseup (e) {}

// cover
function handleCoverMousedown (e) {
	e.preventDefault();
	e.stopPropagation();
	e.returnValue = false;
}
function handleCoverClick (e) {
	fireEvent('focus-me');
}
function handleCoverMousewheel (e) {
	e.preventDefault();
	e.stopPropagation();
	e.returnValue = false;
	switch (state) {
	case 'normal':
		switch (inputMode) {
		case 'command':
			var delta = 0;
			if (e.wheelDelta) {
				delta = 3 * (e.wheelDelta > 0 ? -1 : 1);
			}
			else if (e.detail) {
				delta = e.detail;
			}
			if (delta) {
				executeViCommand(Math.abs(delta) + (delta > 0 ? '\u0005' : '\u0019'), true);
			}
			break;
		}
		break;
	}
}

// frame channel
function handleExtensionChannelMessage (req) {
	if (!req) return;

	switch (req.type) {
	case 'relocate':
		targetElement.rect = req.rect;
		setGeometory();
		break;
	case 'authorize-response':
		if (req.error) {
			requestShowMessage(req.error, true, false);
			exCommandExecutor.stop();
			break;
		}
		showMessage(_('Obtaining access rights ({0})...', req.phase || '-'));
		break;
	case 'focus-me-response':
		switch (state) {
		case 'normal':
			cursor.update({focused:true, visible:!backlog.visible});
			break;
		case 'line-input':
			cursor.update({focused:false, visible:false});
			$(LINE_INPUT_ID).focus();
			break;
		}
		break;
	case 'fileio-write-response':
		if (req.error) {
			showMessage(req.error, true, false);
			//exCommandExecutor.stop();
			break;
		}
		switch (req.state) {
		case 'buffered':
			showMessage(_('Buffered: {0}', fileName));
			break;
		case 'writing':
			showMessage(_('Writing ({0}%)', req.progress.toFixed(2)));
			break;
		case 'complete':
			showMessage(_('Written: {0}', getFileIoResultInfo(req.meta.charLength)));
			break;
		}
		//exCommandExecutor.runAsyncNext();
		break;
	case 'fileio-read-response':
		if (req.error) {
			showMessage(req.error, true, false);
			exCommandExecutor.stop();
			break;
		}
		switch (req.state) {
		case 'reading':
			showMessage(_('Reading ({0}%)', req.progress.toFixed(2)));
			break;
		case 'complete':
			var read = exCommandExecutor.lastCommandObj.clone();
			read.handler = function (app, t, a) {
				switch (this.name) {
				case 'read':
					return Wasavi.ExCommand.read(app, t, a, req.content, req.meta);
				case 'edit':
					return Wasavi.ExCommand.edit(app, t, a, req.content, req.meta);
				}
				return _('Invalid read handler.');
			};
			cursor.update({visible:false});
			exCommandExecutor.runAsyncNext(read, exCommandExecutor.lastCommandArg);
			break;
		}
	}
}


/*
 * variables {{{1
 * ----------------
 */

// persistent variables

var appProxy = new AppProxy;
var Position = Wasavi.Position;
var extensionChannel;
var wasaviFrame;
var version;
var exrc;
var fontFamily = 'monospace';
var quickActivation;
var testMode;
var devMode;
var fstab;
var substituteWorker;
var resizeHandlerInvokeTimer;
var abbrevs = new Collection;
var keyManager = new Wasavi.KeyManager;
var regexConverter = new Wasavi.RegexConverter(appProxy);
var mapManager = new Wasavi.MapManager(appProxy);
var theme = new Wasavi.Theme(appProxy);
var config = new Wasavi.Configurator(appProxy,
	[
		/* defined by POSIX */
		['autoindent', 'b', true],
		['autoprint', 'b', true],     // not used
		['autowrite', 'b', false],    // not used
		['beautify', 'b', false],     // not used
		['directory', 's', '/tmp/'],  // not used
		['edcompatible', 'b', false], // not used
		['errorbells', 'b', false],
		['exrc', 'b', false],         // not used
		['ignorecase', 'b', true],
		['list', 'b', false],         // not used
		['magic', 'b', true],
		['mesg', 'b', true],          // not used
		['number', 'b', false, function (v) {
			idealWidthPixels = -1;
			v && config.setData('norelativenumber');
			return v;
		}],
		['paragraphs', 's', 'IPLPPPQPP LIpplpipbp', function (v) {
			searchUtils && searchUtils.setParagraphMacros(v);
			return v;
		}],
		['prompt', 'b', true],
		['readonly', 'b', false],
		['redraw', 'b', true],        // not used
		['remap', 'b', true],
		['report', 'i', 5],
		['scroll', 'i', 0],
		['sections', 's', 'NHSHH HUnhsh', function (v) {
			searchUtils && searchUtils.setSectionMacros(v);
			return v;
		}],
		['shell', 's', '/bin/sh'],    // not used
		['shiftwidth', 'i', 4],
		['showmatch', 'b', true],
		['showmode', 'b', true],
		['slowopen', 'b', false],     // not used
		['tabstop', 'i', 8, function (v) {
			setTabStop(v);
			return v;
		}],
		['taglength', 'i', 0],        // not used
		['tags', 's', 'tags'],        // not used
		['term', 's', 'dom'],         // not used
		['terse', 'b', false],        // not used
		['warn', 'b', true],          // not used
		['window', 'i', 24],
		['wrapmargin', 'i', 0],
		['wrapscan', 'b', true],
		['writeany', 'b', false],     // not used

		/* defined by wasavi */
		['theme', 's', '', function (v) {
			theme.select(v) && theme.update();
			return v;
		}],
		['smooth', 'b', true],
		['bellvolume', 'i', 25],
		['history', 'i', 20],
		['monospace', 'i', 20],
		['fullscreen', 'b', false, function (v) {
			!isStandAlone &&
			targetElement &&
			fireEvent('window-state', {
				tabId:extensionChannel.tabId,
				state:v ? 'maximized' : 'normal',
				modelineHeight:$('wasavi_footer').offsetHeight
			});
			return v;
		}],
		['jkdenotative', 'b', false],

		/* defined by vim */
		['iskeyword', 'r', '^[a-zA-Z0-9_]\\+$'],
		['searchincr', 'b', true],
		['smartcase', 'b', true],
		['undolevels', 'i', 20, function (v) {
			if (editLogger) {
				editLogger.logMax = v;
			}
			return v;
		}],
		['quoteescape', 's', '\\'],
		['relativenumber', 'b', false, function (v) {
			idealWidthPixels = -1;
			v && config.setData('nonumber');
			return v;
		}],
		['textwidth', 'i', 0],
		['modified', 'b', false, null, true],

		/* defined by nvi */
		//['altwerase', 'b', false],
		//['backup', 's', ''],
		//['cdpath', 's', ':'],
		//['cedit', 's', ''],
		['columns', 'i', 0, null, true],
		//['combined', 'b', false],
		//['comment', 'b', false],
		//['escapetime', 'i', 6],
		//['extended', 'b', false],
		//['filec', 's', ''],
		//['fileencoding', 's', ''],
		//['flash', 'b', true],
		//['hardtabs', 'i', 0],
		//['iclower', 'b', false],
		//['inputencoding', 's', ''],
		//['keytime', 'i', 6],
		//['leftright', 'b', false],
		['lines', 'i', 0, null, true],
		//['lisp', 'b', false],
		//['lock', 'b', true],
		['matchtime', 'i', 5],
		//['modeline', 'b', false],
		//['msgcat', 's', '/usr/share/vi/catalog/'],
		//['noprint', 's', ''],
		//['octal', 'b', false],
		//['open', 'b', true],
		//['optimize', 'b', true],
		//['path', 's', ''],
		//['print', 's', ''],
		//['recdir', 's', '/var/tmp/vi.recover'],
		//['ruler', 'b', false],
		//['secure', 'b', false],
		//['shellmeta', 's', '~{[*?$`\'"\\'],
		//['sidescroll', 'i', 16],
		//['sourceany', 'b', false],
		//['tildeop', 'b', false],
		//['timeout', 'b', true],
		//['ttywerase', 'b', false],
		//['verbose', 'b', false],
		//['w1200', 'i', 0],
		//['w300', 'i', 0],
		//['w9600', 'i', 0],
		//['windowname', 'b', false],
		//['wraplen', 'i', 0],
	],
	{
		ai: 'autoindent',		ap: 'autoprint',	aw: 'autowrite',
		bf: 'beautify',			co: 'columns',		dir: 'tmp_directory',
		eb: 'errorbells',		ed: 'edcompatible',	ex: 'exrc',
		fe: 'fileencoding',		ht: 'hardtabs',		ic: 'ignorecase',
		ie: 'inputencoding',	li: 'lines',		modelines: 'modeline',
		nu: 'number',			opt: 'optimize',	para: 'paragraphs',
		re: 'redraw',			ro: 'readonly',		scr: 'scroll',
		sect: 'sections',		sh: 'shell',		slow: 'slowopen',
		sm: 'showmatch',		smd: 'showmode',	sw: 'shiftwidth',
		tag: 'tags',			tl: 'taglength',	to: 'timeout',
		ts: 'tabstop',			tty: 'term',		ttytype: 'term',
		w: 'window',			wa: 'writeany',		wi: 'window',
		wl: 'wraplen',			wm: 'wrapmargin',	ws: 'wrapscan',

		isk: 'iskeyword', incsearch: 'searchincr',	is: 'searchincr',
		scs: 'smartcase',		tw: 'textwidth',	ul: 'undolevels',
		qe: 'quoteescape',		rnu: 'relativenumber',

		fs: 'fullscreen',		jk: 'jkdenotative'
	}
);
var isStandAlone = (function () {
	try {
		return window.chrome ? window.parent == window : !!!window.frameElement;
	} catch (e) {
		return false;
	}
})();

// extension depend objects
var registers;
var lineInputHistories;
var bell;
var l10n;
var ffttDictionary;
var lineBreaker;

// instance variables
var targetElement;
var buffer;
var fileName;
var preferredNewline;
var terminated;
var writeOnTermination;
var state;
var runLevel;
var marks;
var cursor;
var scroller;
var editLogger;
var prefixInput;
var inputHandler;
var inputModeStack;
var inputMode;
var inputModeSub;
var requestedState;
var lineHeight;
var charWidth;
var idealWidthPixels;
var idealDenotativeWidthPixels;
var backlog;
var pairBracketsIndicator;
var exCommandExecutor;
var searchUtils;
var recordedStrokes;
var literalInput;

var isEditCompleted;
var isVerticalMotion;
var isReadonlyWarned;
var isInteractive;
var isSmoothScrollRequested;
var isSimpleCommandUpdateRequested;
var isJumpBaseUpdateRequested;
var isLastKeyCodeLocked;
var isBulkInputting;

var lastKeyCode;
var lastSimpleCommand;
var lastHorzFindCommand;
var lastRegexFindCommand;
var lastSubstituteInfo;
var lastMessage;

/*
 * command mode mapping {{{1
 * ----------------
 */

var commandMap = {
	// internal special
	'\u0000': function () {
		return true;
	},

	// escape
	'\u001b': inputEscape,

	// digits
	'1': inputDigit, '2': inputDigit, '3': inputDigit, '4': inputDigit, '5': inputDigit,
	'6': inputDigit, '7': inputDigit, '8': inputDigit, '9': inputDigit,

	// register specifier
	'"': {
		'command': function (c, o) {
			if (prefixInput.isEmpty) {
				inputModeSub = 'wait-register';
				prefixInput.register = c;
				requestShowPrefixInput(_('{0}: register (a-z,A-Z,1-9)', o.e.fullIdentifier));
			}
			else {
				inputEscape(o.e.fullIdentifier);
			}
			return false;
		},
		'wait-register': function (c) {
			prefixInput.appendRegister(c);
			requestShowPrefixInput();
		}
	},

	/*
	 * operators
	 */

	c: {
		'command': operationDefault,
		'@op': function (c) {
			if (c == prefixInput.operation) {
				this._.apply(this, arguments);
			}
			if (requestedState.notice) {
				return false;
			}

			buffer.regalizeSelectionRelation();
			var origin = buffer.selectionStart;
			var adjusted = adjustDeleteOperationPos(
				c == prefixInput.operation || isVerticalMotion,
				buffer.selectionEndRow - buffer.selectionStartRow + 1);
			var isLineOrient = adjusted.isLineOrient;
			var actualCount = adjusted.actualCount;

			editLogger.open('change op');

			buffer.isLineOrientSelection = isLineOrient;
			if (isLineOrient) {
				var selfIndent = buffer.getIndent(origin);
				buffer.selectionEnd = buffer.selectionStart;
				buffer.isLineOrientSelection = true;
				yank(actualCount);
				var deleted = deleteSelection();
				if (deleted >= config.vars.report) {
					requestShowMessage(_('Changing {0} {line:0}.', deleted));
				}
				buffer.isLineOrientSelection = false;

				if (buffer.rowLength == 1 && buffer.rows(0) == '') {
					var indent = config.vars.autoindent ? selfIndent : '';
					insert(indent);
				}
				else if (origin.row >= buffer.rowLength) {
					var n = buffer.selectionStart;
					var indent = config.vars.autoindent ? buffer.getIndent(n) : '';
					n = buffer.getLineTailOffset(n);
					buffer.setSelectionRange(n);
					insert('\n' + indent);
				}
				else {
					var indent = config.vars.autoindent ? buffer.getBackIndent(buffer.selectionStart) : '';
					insert(indent);
					insert('\n', {keepPosition:true});
				}
			}
			else {
				extendRightIfInclusiveMotion();
				yank(actualCount);
				deleteSelection();
			}

			isEditCompleted = true;
			requestSimpleCommandUpdate();
			return startEdit(c);
		}
	},
	d: {
		'command': operationDefault,
		'@op': function (c) {
			if (c == prefixInput.operation) {
				this._.apply(this, arguments);
			}
			if (requestedState.notice) {
				return false;
			}

			buffer.regalizeSelectionRelation();
			var origin = buffer.selectionStart;
			var adjusted = adjustDeleteOperationPos(
				c == prefixInput.operation || isVerticalMotion,
				buffer.selectionEndRow - buffer.selectionStartRow + 1);
			var isLineOrient = adjusted.isLineOrient;
			var actualCount = adjusted.actualCount;

			buffer.isLineOrientSelection = isLineOrient;
			if (isLineOrient) {
				buffer.selectionEnd = buffer.selectionStart;
			}
			else {
				extendRightIfInclusiveMotion();
			}

			yank(actualCount);
			var deleted = deleteSelection();

			if (isLineOrient) {
				origin.row = Math.min(origin.row, buffer.rowLength - 1);
				buffer.setSelectionRange(buffer.getLineTopOffset2(origin));

				if (deleted >= config.vars.report) {
					requestShowMessage(_('Deleted {0} {line:0}.', deleted));
				}
			}

			isEditCompleted = true;
			requestSimpleCommandUpdate();
			return true;
		}
	},
	y: {
		'command': operationDefault,
		'@op': function (c) {
			var ss = buffer.selectionStart;
			var se = buffer.selectionEnd;
			var origin = ss.lt(se) ? ss : se;

			if (c == prefixInput.operation) {
				this._.apply(this, arguments);
			}
			if (requestedState.notice) {
				return false;
			}

			var isLineOrient = c == prefixInput.operation || isVerticalMotion;
			var actualCount = Math.abs(buffer.selectionEndRow - buffer.selectionStartRow) + 1;

			buffer.isLineOrientSelection = isLineOrient;
			!isLineOrient && extendRightIfInclusiveMotion();
			yank();
			buffer.setSelectionRange(origin);
			requestSimpleCommandUpdate();
			return true;
		}
	},
	'<': {
		'command': operationDefault,
		'@op': function (c, o) {
			if (c == prefixInput.operation) {
				this._.apply(this, arguments);
			}
			if (requestedState.notice) {
				return false;
			}

			buffer.regalizeSelectionRelation();
			var isLineOrient = c == prefixInput.operation || isVerticalMotion;
			var actualCount = buffer.selectionEndRow - buffer.selectionStartRow + 1;

			// special shift behavior followed vim.
			if (!isLineOrient && buffer.selectionEndCol == 0 && actualCount > 1) {
				actualCount--;
				buffer.selectionEnd = buffer.leftPos(buffer.selectionEnd);
			}

			(o.key == '<' ? unshift : shift)(actualCount);
			buffer.setSelectionRange(buffer.getLineTopOffset2(buffer.selectionStart));
			isVerticalMotion = true;
			prefixInput.motion = c;
			requestSimpleCommandUpdate();
			return true;
		}
	},
	'>': {
		'command': operationDefault,
		'@op': function () {
			return this['<']['@op'].apply(this, arguments);
		}
	},

	/*
	 * operator shortcuts
	 */

	// C: change to the end of the line (equivalents to c$)
	C: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			this.$('', buffer);
			isVerticalMotion = false;
			prefixInput.operation = c;
			return this.c['@op'].call(this, '', buffer);
		}
		return inputEscape(o.e.fullIdentifier);
	},
	// D: delete the characters to the end of the line (equivalents to d$)
	D: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			this.$('', buffer);
			prefixInput.operation = c;
			isVerticalMotion = false;
			return this.d['@op'].call(this, '', buffer);
		}
		return inputEscape(o.e.fullIdentifier);
	},
	// Y: yank the lines (equivalents to yy)
	Y: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			prefixInput.operation = c;
			isVerticalMotion = true;
			return this.y['@op'].call(this, c, buffer);
		}
		return inputEscape(o.e.fullIdentifier);
	},

	/*
	 * motions
	 */

	// backwards lines, to first non-white character
	'-': function (c, o) {
		var n = buffer.selectionStart;
		if (n.row == 0) {
			return inputEscape(o.e.fullIdentifier);
		}
		n.row = Math.max(n.row - prefixInput.count, 0);
		buffer.selectionStart = buffer.getLineTopOffset2(n);
		isVerticalMotion = true;
		prefixInput.motion = c;
		return true;
	},
	'+': function (c, o) {
		var n = buffer.selectionEnd;
		if (n.row >= buffer.rowLength - 1) {
			return inputEscape(o.e.fullIdentifier);
		}
		n.row = Math.min(n.row + prefixInput.count, buffer.rowLength - 1);
		buffer.selectionEnd = buffer.getLineTopOffset2(n);
		isVerticalMotion = true;
		prefixInput.motion = c;
		return true;
	},
	// jump to fist non-blank position on current line
	'^': function (c) {
		return (isDenotativeState() ? motionLineStartDenotative : motionLineStart)(c, false);
	},
	'<home>': function () {
		return this['^'].apply(this, arguments);
	},
	// jump to end of line
	'$': function (c) {
		if (isDenotativeState()) {
			prefixInput.count > 1 && motionUpDownDenotative(c, prefixInput.count - 1, true);
			return motionLineEndDenotative(c, false);
		}
		var count = Math.min(prefixInput.count, buffer.rowLength - buffer.selectionStartRow);
		count > 1 && motionDown(c, count - 1);
		return motionLineEnd(c, false);
	},
	'<end>': function () {
		return this.$.apply(this, arguments);
	},
	// jump to matching <, (, {, or [
	'%': function (c, o) {
		prefixInput.motion = c;
		var result = searchUtils.findMatchedBracket(prefixInput.count);
		if (result) {
			marks.setJumpBaseMark();
			buffer.extendSelectionTo(result);
			idealWidthPixels = -1;
			isSmoothScrollRequested = true;
			return true;
		}
		return inputEscape(o.e.fullIdentifier);
	},
	// direct jump to specified column
	'|': function (c) {
		// TODO: need to treat specified column index as logical number
		//       which in consideration of a proportional font width.
		var n = buffer.selectionStart;
		n.col = Math.min(prefixInput.count - 1, buffer.rows(n).length);
		buffer.extendSelectionTo(n);
		prefixInput.motion = c;
		idealWidthPixels = -1;
		return true;
	},
	// invert of last find
	',': function (c) {
		prefixInput.motion = c;
		var result = false;
		switch (lastHorzFindCommand.direction) {
		case -1:
			result = motionFindForward(
				lastHorzFindCommand.letter,
				prefixInput.count,
				lastHorzFindCommand.stopBefore,
				true);
			lastHorzFindCommand.direction *= -1;
			break;
		case 1:
			result = motionFindBackward(
				lastHorzFindCommand.letter,
				prefixInput.count,
				lastHorzFindCommand.stopBefore,
				true);
			lastHorzFindCommand.direction *= -1;
			break;
		}
		return result;
	},
	// repeat last find
	';': function (c) {
		prefixInput.motion = c;
		var result = false;
		switch (lastHorzFindCommand.direction) {
		case -1:
			result = motionFindBackward(
				lastHorzFindCommand.letter,
				prefixInput.count,
				lastHorzFindCommand.stopBefore,
				true);
			break;
		case 1:
			result = motionFindForward(
				lastHorzFindCommand.letter,
				prefixInput.count,
				lastHorzFindCommand.stopBefore,
				true);
			break;
		}
		return result;
	},
	// down, line orient
	_: function (c) {
		var count = Math.min(prefixInput.count, buffer.rowLength - buffer.selectionStartRow);
		count > 1 && motionDown(c, count - 1);
		buffer.extendSelectionTo(buffer.getLineTopOffset2(buffer.selectionEnd));
		isVerticalMotion = true;
		return true;
	},
	// search forward
	'/': {
		'command': function (c) {
			prefixInput.motion = c;
			lineInputHistories.defaultName = '/';
			requestInputMode('line-input', '', c);
			lastRegexFindCommand.push({
				head: c,
				direction: c == '/' ? 1 : -1,
				offset: buffer.selectionStart,
				scrollTop: buffer.scrollTop,
				scrollLeft: buffer.scrollLeft
			});
			return false;
		},
		'line-input': function (c, o) {
			var pattern;
			if (c != '') {
				lastRegexFindCommand.setPattern(c, true);
				registers.set('/', lastRegexFindCommand.pattern, false);
				pattern = lastRegexFindCommand.pattern;
			}
			else {
				if (!registers.exists('/') || (pattern = registers.get('/').data) == '') {
					requestShowMessage(_('No previous search pattern.'), true);
					return true;
				}
			}
			lineInputHistories.push(pattern);
			return motionFindByRegexFacade(
				pattern,
				prefixInput.count,
				o.key == '/' ? 1 : -1,
				lastRegexFindCommand.verticalOffset);
		},
		'@line-input-notify': function (c, o) {
			if (config.vars.searchincr) {
				lastRegexFindCommand.setPattern(c, true);
				var r = (o.key == '/' ? motionFindByRegexForward : motionFindByRegexBackward)
					(lastRegexFindCommand.pattern, 1);
				if (r) {
					buffer.setSelectionRange(r.offset, r.offset + r.matchLength);
					cursor.ensureVisible();
					buffer.emphasis(undefined, r.matchLength);
				}
			}
		},
		'@line-input-reset': function (c) {
			buffer.unEmphasis();
			buffer.setSelectionRange(lastRegexFindCommand.offset);
			buffer.scrollTop = lastRegexFindCommand.scrollTop;
			buffer.scrollLeft = lastRegexFindCommand.scrollLeft;
		},
		'@line-input-escape': function (c) {
			buffer.unEmphasis();
			buffer.setSelectionRange(lastRegexFindCommand.offset);
			buffer.scrollTop = lastRegexFindCommand.scrollTop;
			buffer.scrollLeft = lastRegexFindCommand.scrollLeft;
			cursor.update({visible:true});
			cursor.ensureVisible();
		}
	},
	// search backward
	'?': {
		'command': function (c, o) {
			return this['/'][o.subkey].apply(this, arguments);
		},
		'line-input': function (c, o) {
			return this['/'][o.subkey].apply(this, arguments);
		},
		'@line-input-notify': function (c, o) {
			return this['/'][o.subkey].apply(this, arguments);
		},
		'@line-input-reset': function (c, o) {
			return this['/'][o.subkey].apply(this, arguments);
		},
		'@line-input-escape': function (c, o) {
			return this['/'][o.subkey].apply(this, arguments);
		}
	},
	// return to line specified by following mark, first white position on line, line orient motion
	"'": {
		'command': function (c, o) {
			prefixInput.motion = c;
			inputModeSub = 'wait-a-letter';
			requestShowPrefixInput(_('{0}: return to mark', o.e.fullIdentifier));
			return false;
		},
		'wait-a-letter': function (c, o) {
			prefixInput.appendMotion(c);
			var offset = marks.get(c);
			if (offset != undefined) {
				if ('\'`[]'.indexOf(c) >= 0) {
					marks.setJumpBaseMark();
				}
				if (o.key == "'") {
					buffer.extendSelectionTo(buffer.getLineTopOffset2(offset));
					isVerticalMotion = true;
					idealWidthPixels = -1;
				}
				else {
					buffer.extendSelectionTo(offset);
				}
				isSmoothScrollRequested = true;
				return true;
			}
			else {
				requestShowMessage(_('Mark {0} is not set.', c), true);
				return inputEscape(o.e.fullIdentifier);
			}
		}
	},
	// return to marked line at remembered column, character orient motion
	'`': {
		'command': function (c, o) {
			return this["'"][o.subkey].apply(this, arguments);
		},
		'wait-a-letter': function (c, o) {
			return this["'"][o.subkey].apply(this, arguments);
		}
	},
	// back an sentence
	'(': function (c, o) {
		prefixInput.motion = c;
		var pos = searchUtils.findSentenceBoundary(
			prefixInput.count, o.key == ')', true);
		if (pos) {
			marks.setJumpBaseMark();
			if (o.key == '(') {
				buffer.selectionStart = pos;
			}
			else {
				buffer.selectionEnd = pos;
			}
			return true;
		}
		return inputEscape(prefixInput.motion);
	},
	// forward an sentence
	')': function () {
		return this['('].apply(this, arguments);
	},
	// back a paragraph
	'{': function (c, o) {
		prefixInput.motion = c;
		var pos = searchUtils.findParagraphBoundary(
			prefixInput.count, o.key == '}', true);
		if (pos) {
			marks.setJumpBaseMark();
			if (o.key == '{') {
				buffer.selectionStart = pos;
			}
			else {
				buffer.selectionEnd = pos;
			}
			isVerticalMotion = prefixInput.isEmptyOperation;
			return true;
		}
		return inputEscape(prefixInput.motion);
	},
	// forward a paragraph
	'}': function () {
		return this['{'].apply(this, arguments);
	},
	// move to previous section
	'[': {
		'command': function (c) {
			prefixInput.motion = c;
			inputModeSub = 'wait-a-letter';
			requestShowPrefixInput();
			return false;
		},
		'wait-a-letter': function (c) {
			if (c == prefixInput.motion) {
				prefixInput.appendMotion(c);
				var pos = searchUtils.findParagraphBoundary(
					prefixInput.count, false, true, '{', false);
				if (pos) {
					marks.setJumpBaseMark();
					buffer.selectionStart = buffer.getLineTopOffset2(pos);
					isVerticalMotion = prefixInput.isEmptyOperation;
					return true;
				}
			}
			return inputEscape(prefixInput.motion);
		}
	},
	// move to next section
	']': {
		'command': function (c, o) {
			return this['['][o.subkey].apply(this, arguments);
		},
		'wait-a-letter': function (c) {
			if (c == prefixInput.motion) {
				prefixInput.appendMotion(c);
				var pos = searchUtils.findParagraphBoundary(
					prefixInput.count, true, true, '{', !prefixInput.isEmptyOperation);
				if (pos) {
					marks.setJumpBaseMark();
					buffer.selectionEnd = buffer.getLineTopOffset2(pos);
					isVerticalMotion = prefixInput.isEmptyOperation;
					return true;
				}
			}
			return inputEscape(prefixInput.motion);
		}
	},
	'\u000d'/*enter*/: function () {
		return this['+'].apply(this, arguments);
	},
	'0': function (c) {
		if (prefixInput.count1 == '' && prefixInput.count2 == '') {
			return motionLineStart(c, true);
		}
		else {
			return inputDigit(c);
		}
	},
	j: function (c) {
		return callDenotativeFunction(c, prefixInput.count, true);
	},
	'\u000e'/*^N*/: function () {
		return this.j.apply(this, arguments);
	},
	'<down>': function () {
		return this.j.apply(this, arguments);
	},
	k: function (c) {
		return callDenotativeFunction(c, prefixInput.count);
	},
	'\u0010'/*^P*/: function () {
		return this.k.apply(this, arguments);
	},
	'<up>': function () {
		return this.k.apply(this, arguments);
	},
	h: function (c) {
		return motionLeft(c, prefixInput.count);
	},
	'<left>': function () {
		return this.h.apply(this, arguments);
	},
	'\u0008'/*^H*/: function () {
		return this.h.apply(this, arguments);
	},
	l: function (c) {
		return motionRight(c, prefixInput.count);
	},
	' ': function (c, o) {
		return this[o.e.shift ? 'h' : 'l'].apply(this, arguments);
	},
	'<right>': function () {
		return this.l.apply(this, arguments);
	},
	w: function (c, o) {
		if (prefixInput.operation == 'c') {
			motionNextWord(c, prefixInput.count, o.key == 'W', true);
			if (!buffer.isNewline(buffer.selectionEnd)) {
				buffer.selectionEnd = buffer.rightPos(buffer.selectionEnd);
			}
			return true;
		}
		else {
			return motionNextWord(c, prefixInput.count, o.key == 'W');
		}
	},
	W: function () {
		return this.w.apply(this, arguments);
	},
	b: function (c, o) {
		motionPrevWord(c, prefixInput.count, o.key == 'B');
		if (prefixInput.operation == 'c' && buffer.selectionEndCol == 0) {
			buffer.selectionEnd = buffer.leftPos(buffer.selectionEnd);
		}
		return true;
	},
	B: function () {
		return this.b.apply(this, arguments);
	},
	e: function (c, o) {
		return motionNextWord(c, prefixInput.count, o.key == 'E', true);
	},
	E: function () {
		return this.e.apply(this, arguments);
	},
	g: {
		'command': function (c) {
			inputModeSub = 'wait-a-letter';
			requestShowPrefixInput(prefixInput.operation + c);
			return false;
		},
		'wait-a-letter': function (c, o) {
			var result = false;
			switch (c) {
			case 'g':
				var index = prefixInput.count;
				var n = new Position(index - 1, 0);
				marks.setJumpBaseMark();
				if (prefixInput.isEmptyOperation) {
					buffer.setSelectionRange(buffer.getLineTopOffset2(n));
					var node = buffer.rowNodes(n);
					var viewHeightHalf = parseInt((buffer.elm.clientHeight - lineHeight) / 2)
					scroller.run(Math.max(0, node.offsetTop - viewHeightHalf));
				}
				else {
					buffer.extendSelectionTo(buffer.getLineTopOffset2(n));
				}
				isVerticalMotion = true;
				idealWidthPixels = -1;
				prefixInput.motion = o.key + c;
				result = true;
				break;
			case 'i':
				var m = inputHandler.getStartPosition();
				if (m) {
					buffer.setSelectionRange(m);
					editLogger.open('edit-wrapper');
					result = startEdit(c);
				}
				else {
					requestRegisterNotice(_('Last inputted position is undefined.'));
					result = true;
				}
				prefixInput.motion = o.key + c;
				break;
			case 'j':
				prefixInput.motion = o.key + c;
				result = this.j.apply(this, arguments);
				break;
			case 'k':
				prefixInput.motion = o.key + c;
				result = this.k.apply(this, arguments);
				break;
			case '^':
				prefixInput.motion = o.key + c;
				result = this['^'].apply(this, arguments);
				break;
			case '$':
				prefixInput.motion = o.key + c;
				result = this['$'].apply(this, arguments);
				break;
			case 'q':
				result = operationDefault(o.key + c, o);
				break;
			default:
				requestRegisterNotice(_('Unknown g-prefixed command: {0}', c));
				result = true;
				break;
			}
			return result;
		}
	},
	gq: {
		'@op': function (c, o) {
			if (c == prefixInput.operation.substring(1)) {
				this._.apply(this, arguments);
			}
			if (requestedState.notice) {
				return false;
			}

			buffer.regalizeSelectionRelation();
			var adjusted = adjustDeleteOperationPos(
				c == prefixInput.operation.substring(1) || isVerticalMotion,
				buffer.selectionEndRow - buffer.selectionStartRow + 1);
			var isLineOrient = adjusted.isLineOrient;
			var actualCount = adjusted.actualCount;

			!isLineOrient && extendRightIfInclusiveMotion();
			buffer.setSelectionRange(reformat());
			requestSimpleCommandUpdate();
			return true;
		}
	},
	H: function (c) {
		var v = getCurrentViewPositionIndices();
		var index = Math.min(v.top + prefixInput.count - 1, v.bottom, buffer.rowLength - 1);
		marks.setJumpBaseMark();
		buffer.extendSelectionTo(buffer.getLineTopOffset2(index, 0));
		isVerticalMotion = true;
		idealWidthPixels = -1;
		prefixInput.motion = c;
		return true;
	},
	M: function (c) {
		var v = getCurrentViewPositionIndices();
		var index = v.top + parseInt(v.lines / 2);
		marks.setJumpBaseMark();
		buffer.extendSelectionTo(buffer.getLineTopOffset2(index, 0));
		isVerticalMotion = true;
		idealWidthPixels = -1;
		prefixInput.motion = c;
		return true;
	},
	L: function (c) {
		var v = getCurrentViewPositionIndices();
		var index = Math.max(v.bottom - prefixInput.count + 1, v.top, 0);
		marks.setJumpBaseMark();
		buffer.extendSelectionTo(buffer.getLineTopOffset2(index, 0));
		isVerticalMotion = true;
		idealWidthPixels = -1;
		prefixInput.motion = c;
		return true;
	},
	G: function (c) {
		var index = prefixInput.isCountSpecified ?
			Math.max(Math.min(prefixInput.count, buffer.rowLength), 1) : buffer.rowLength;
		var n = new Position(index - 1, 0);
		marks.setJumpBaseMark();
		if (prefixInput.isEmptyOperation) {
			buffer.setSelectionRange(buffer.getLineTopOffset2(n));
			var node = buffer.rowNodes(n);
			var viewHeightHalf = parseInt((buffer.elm.clientHeight - lineHeight) / 2)
			scroller.run(Math.max(0, node.offsetTop - viewHeightHalf));
		}
		else {
			buffer.extendSelectionTo(buffer.getLineTopOffset2(n));
		}
		isVerticalMotion = true;
		isSmoothScrollRequested = true;
		idealWidthPixels = -1;
		prefixInput.motion = c;
		return true;
	},
	f: {
		'command': function (c, o) {
			prefixInput.motion = c;
			inputModeSub = 'wait-a-letter';
			requestShowPrefixInput(
				o.key == 'f' || o.key == 't' ?
					_('{0}: find forward', o.e.fullIdentifier) :
					_('{0}: find backward', o.e.fullIdentifier)
			);
			return false;
		},
		'wait-a-letter': function (c, o) {
			prefixInput.trailer = c;
			return (o.key == 'f' || o.key == 't' ? motionFindForward : motionFindBackward)
				(c, prefixInput.count, o.key == 't' || o.key == 'T');
		}
	},
	F: {
		'command': function (c, o) {
			return this.f[o.subkey].apply(this, arguments);
		},
		'wait-a-letter': function (c, o) {
			return this.f[o.subkey].apply(this, arguments);
		}
	},
	t: {
		'command': function (c, o) {
			return this.f[o.subkey].apply(this, arguments);
		},
		'wait-a-letter': function (c, o) {
			return this.f[o.subkey].apply(this, arguments);
		}
	},
	T: {
		'command': function (c, o) {
			return this.f[o.subkey].apply(this, arguments);
		},
		'wait-a-letter': function (c, o) {
			return this.f[o.subkey].apply(this, arguments);
		}
	},
	// search next match for current pattern
	n: function (c, o) {
		if (registers.exists('/')) {
			prefixInput.motion = c;
			isSmoothScrollRequested = true;
			return motionFindByRegexFacade(
				registers.get('/').data, prefixInput.count,
				lastRegexFindCommand.direction * (o.key == 'n' ? 1 : -1),
				lastRegexFindCommand.verticalOffset);
		}
		requestShowMessage(_('No previous search pattern.'), true);
		return false;
	},
	// search previous match for current pattern
	N: function () {
		return this.n.apply(this, arguments);
	},

	/*
	 * scrollers (independent motions)
	 */

	// scroll up half (height of screen) lines
	'\u0015'/*^U*/: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			var dir = o.key == '\u0015' ? -1 : 1;
			return scrollView(c, function (v) {
				if (config.vars.scroll > 0) {
					return dir * config.vars.scroll * prefixInput.count;
				}
				else {
					return dir * parseInt(v.lines / 2) * prefixInput.count;
				}
			});
		}
		return inputEscape(o.e.fullIdentifier);
	},
	// scroll down half (height of screen) lines
	'\u0004'/*^D*/: function () {
		return this['\u0015'].apply(this, arguments);
	},
	// scroll up 1 line
	'\u0019'/*^Y*/: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			var ss = config.vars.smooth;
			var dir = o.key == '\u0019' ? -1 : 1;
			config.vars.smooth = false;
			try {
				return scrollView(c, dir * prefixInput.count);
			}
			finally {
				config.vars.smooth = ss;
			}
		}
		return inputEscape(o.e.fullIdentifier);
	},
	// scroll down 1 line
	'\u0005'/*^E*/: function () {
		return this['\u0019'].apply(this, arguments);
	},
	// scroll up (height of screen - 2) lines
	'\u0002'/*^B*/: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			var dir = (o.key == '\u0002' || o.key == '<pageup>') ? -1 : 1;
			return scrollView(c, function (v) {
				return dir * Math.max(v.lines - 2, 1) * prefixInput.count;
			});
		}
		return inputEscape(o.e.fullIdentifier);
	},
	'<pageup>': function () {
		return this['\u0002'].apply(this, arguments);
	},
	// scroll down (height of screen - 2) lines
	'\u0006'/*^F*/: function () {
		return this['\u0002'].apply(this, arguments);
	},
	'<pagedown>': function () {
		return this['\u0002'].apply(this, arguments);
	},
	// z: screen adjustment
	//   z<CR> (top of the screen)
	//   z.    (center of the screen)
	//   zz
	//   z-    (bottom of the screen)
	z: {
		'command': function (c, o) {
			if (prefixInput.isEmptyOperation) {
				prefixInput.operation = c;
				inputModeSub = 'wait-a-letter';
				requestShowPrefixInput(_('{0}: screen adjustment', o.e.fullIdentifier));
			}
			else {
				inputEscape(o.e.fullIdentifier);
			}
			return false;
		},
		'wait-a-letter': function (c) {
			prefixInput.motion = c;
			return true;
		},
		'@op': function (c) {
			var motion = prefixInput.motion;
			var line = prefixInput.isCountSpecified ?
				Math.max(Math.min(prefixInput.count, buffer.rowLength), 1) - 1 :
				buffer.selectionStartRow;
			var current = buffer.rowNodes(line).offsetTop;
			var n = new Position(line, 0);

			if (prefixInput.isCountSpecified) {
				marks.setJumpBaseMark();
			}
			if (motion == prefixInput.operation) {
				motion = '.';
			}

			switch (motion) {
			case '\u000d':
				buffer.scrollLeft = 0;
				scroller.run(current, function () {
					buffer.setSelectionRange(buffer.getLineTopOffset2(n));
					idealWidthPixels = -1;
				});
				break;

			case '.':
				buffer.scrollLeft = 0;
				scroller.run(
					Math.max(current - parseInt((buffer.elm.clientHeight - lineHeight) / 2), 0),
					function () {
						buffer.setSelectionRange(buffer.getLineTopOffset2(n));
						idealWidthPixels = -1;
					}
				);
				break;

			case '-':
				buffer.scrollLeft = 0;
				scroller.run(
					Math.max(current - (buffer.elm.clientHeight - lineHeight), 0),
					function () {
						buffer.setSelectionRange(buffer.getLineTopOffset2(n));
						idealWidthPixels = -1;
					}
				);
				break;

			default:
				requestRegisterNotice(_('Unknown adjust command.'));
				break;
			}
		}
	},

	/*
	 * special key
	 */

	'\u0009'/*tab*/: function (c, o) {
		quickActivation && fireEvent('focus-changed', {direction:o.e.shift ? -1 : 1});
		return false;
	},

	/*
	 * edit commands
	 */

	x: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			prefixInput.operation = c;
			requestSimpleCommandUpdate();
			return (o.key == 'x' || o.key == '\u007f' ?
				deleteCharsForward : deleteCharsBackward)(prefixInput.count, {yank:true});
		}
		return inputEscape(o.e.fullIdentifier);
	},
	'\u007f'/*delete*/: function () {
		return this.x.apply(this, arguments);
	},
	X: function () {
		return this.x.apply(this, arguments);
	},
	p: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			prefixInput.operation = c;
			requestSimpleCommandUpdate();
			return paste(prefixInput.count, {
				isForward:o.key == 'p',
				register:prefixInput.register
			});
		}
		return inputEscape(o.e.fullIdentifier);
	},
	P: function () {
		return this.p.apply(this, arguments);
	},
	J: function (c, o) {
		if (prefixInput.isEmptyOperation
		&& buffer.selectionStartRow < buffer.rowLength - 1) {
			prefixInput.operation = c;
			requestSimpleCommandUpdate();
			return joinLines(prefixInput.count);
		}
		return inputEscape(o.e.fullIdentifier);
	},
	'.': function (c, o) {
		// . command repeats the last
		// !, <, >, A, C, D, I, J, O, P, R, S, X, Y,
		//          a, c, d, i, o, p, r, s,    x, y,
		//          gq,
		// or ~ command.
		if (prefixInput.isEmptyOperation) {
			if (lastSimpleCommand.length) {
				if (prefixInput.isCountSpecified) {
					var p = new Wasavi.PrefixInput(lastSimpleCommand);
					lastSimpleCommand =
						p.register +
						prefixInput.count +
						p.operation +
						p.motion +
						p.trailer;
				}
				executeViCommand(lastSimpleCommand);
				lastSimpleCommand = lastSimpleCommand.replace(
					/^(")([1-8])/, function ($0, $1, $2) {return ($1 || '') + (parseInt($2, 10) + 1);});
			}
			return true;
		}
		return inputEscape(o.e.fullIdentifier);
	},
	u: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			var result = editLogger.undo();
			if (result === false) {
				requestShowMessage(requestRegisterNotice(_('No undo item.')));
			}
			else {
				requestShowMessage(_('{0} {operation:0} have reverted.', result));
				idealWidthPixels= -1;
				config.setData(editLogger.isClean ? 'nomodified' : 'modified');
				return true;
			}
		}
		else {
			inputEscape(o.e.fullIdentifier);
		}
		return false;
	},
	'\u0012'/*^R*/: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			var result = editLogger.redo();
			if (result === false) {
				requestShowMessage(requestRegisterNotice(_('No redo item.')));
			}
			else {
				requestShowMessage(_('{0} {operation:0} have executed again.', result));
				idealWidthPixels= -1;
				config.setData(editLogger.isClean ? 'nomodified' : 'modified');
				return true;
			}
		}
		else {
			inputEscape(o.e.fullIdentifier);
		}
		return false;
	},
	U: null,
	'~': function (c, o) {
		if (prefixInput.isEmptyOperation && !buffer.selected) {
			prefixInput.operation = c;
			requestSimpleCommandUpdate();
			return toggleCase(prefixInput.count);
		}
		return inputEscape(o.e.fullIdentifier);
	},
	// clear screen
	'\u000c'/*^L*/: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			fireEvent('blink-me');
		}
		else {
			inputEscape(o.e.fullIdentifier);
		}
		return false;
	},
	// display file information
	'\u0007'/*^G*/: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			requestShowMessage(getFileInfo());
		}
		else {
			inputEscape(o.e.fullIdentifier);
		}
		return false;
	},
	// marks
	m: {
		'command': function (c, o) {
			if (prefixInput.isEmptyOperation) {
				prefixInput.operation = c;
				inputModeSub = 'wait-a-letter';
				requestShowPrefixInput(_('{0}: mark', o.e.fullIdentifier));
			}
			else {
				inputEscape(o.e.fullIdentifier);
			}
			return false;
		},
		'wait-a-letter': function (c) {
			prefixInput.trailer = c;
			if (!marks.isValidName(c)) {
				requestRegisterNotice(_('Invalid mark name.'));
			}
			marks.set(c, buffer.selectionStart);
			return true;
		}
	},
	// execute register contents as vi command
	'@': {
		'command': function (c, o) {
			if (prefixInput.isEmptyOperation) {
				prefixInput.operation = c;
				inputModeSub = 'wait-a-letter';
				requestShowPrefixInput(_('{0}: register (a-z,A-Z,1-9)', o.e.fullIdentifier));
			}
			else {
				inputEscape(o.e.fullIdentifier);
			}
			return false;
		},
		'wait-a-letter': function (c) {
			if (!registers.isReadable(c)) {
				requestShowMessage(_('Invalid register name: {0}', c), true);
				return inputEscape();
			}
			if (!registers.exists(c)) {
				requestShowMessage(_('Register {0} is not exist.', c), true);
				return inputEscape();
			}
			var command = registers.get(c).data;
			command = command.replace(/^\n+|\n+$/g, '');
			if (command == '') {
				requestShowMessage(_('Register {0} is empty.', c), true);
				return inputEscape();
			}
			prefixInput.trailer = c;
			if (prefixInput.isCountSpecified) {
				var p = new Wasavi.PrefixInput(command);
				command =
					p.register +
					prefixInput.count +
					p.operation +
					p.motion +
					p.trailer;
			}
			executeViCommand(command);
			registers.set('@', command);
			return true;
		}
	},
	// key stroke recorder
	q: {
		'command': function (c, o) {
			if (!prefixInput.isEmptyOperation) {
				// ad hoc solition for gqq
				if (prefixInput.operation == 'gq') {
					prefixInput.motion = c;
					return true;
				}
				inputEscape(o.e.fullIdentifier);
				return false;
			}
			if (recordedStrokes) {
				var stroke = recordedStrokes.strokes.replace(/q$/, '');
				registers.get('"').locked = recordedStrokes.register != '"';
				registers.set(recordedStrokes.register, stroke);
				registers.get('"').locked = false;
				recordedStrokes = null;
				return true;
			}
			inputModeSub = 'wait-a-letter';
			requestShowPrefixInput(_('{0}: record strokes', o.e.fullIdentifier));
			return false;
		},
		'wait-a-letter': function (c) {
			if (/^(?:[A-Z])$/.test(c) && !registers.exists(c)) {
				requestShowMessage(_('Register {0} is not exist.', c), true);
				return inputEscape();
			}
			if (!/^(?:[a-zA-Z0-9"])$/.test(c)) {
				requestShowMessage(_('Invalid register name: {0}', c), true);
				return inputEscape();
			}
			recordedStrokes = {register:c, strokes:''};
			return true;
		}
	},
	r: {
		'command': function (c, o) {
			if (prefixInput.isEmptyOperation) {
				prefixInput.operation = c;
				inputModeSub = 'wait-a-letter';
				requestShowPrefixInput(_('{0}: replace a char', o.e.fullIdentifier));
			}
			else {
				inputEscape(o.e.fullIdentifier);
			}
			return false;
		},
		'wait-a-letter': function (c) {
			if (c != '\u001b') {
				motionReplaceOne(c, prefixInput.count);
				requestSimpleCommandUpdate();
			}
			return true;
		}
	},
	a: {
		'command': function (c, o) {
			if (prefixInput.isEmptyOperation) {
				requestSimpleCommandUpdate();
				editLogger.open('edit-wrapper');
				return startEdit(c, {
					isAppend:c == 'a',
					repeatCount:prefixInput.count});
			}
			prefixInput.motion = c;
			inputModeSub = 'wait-a-letter';
			requestShowPrefixInput(_('{0}: range symbol', o.e.fullIdentifier));
			return false;
		},
		'wait-a-letter': function (c, o) {
			var result = searchUtils.dispatchRangeSymbol(
				prefixInput.count, c, prefixInput.motion == 'a');
			if (result) {
				prefixInput.appendMotion(c);
			}
			else {
				inputEscape(o.e.fullIdentifier);
			}
			return result;
		}
	},
	A: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			requestSimpleCommandUpdate();
			editLogger.open('edit-wrapper');
			return startEdit(c, {
				isAppend:c == 'A',
				isAlter:true,
				repeatCount:prefixInput.count});
		}
		return inputEscape(o.e.fullIdentifier);
	},
	i: {
		'command': function (c, o) {
			return this.a[o.subkey].apply(this, arguments);
		},
		'wait-a-letter': function (c, o) {
			return this.a[o.subkey].apply(this, arguments);
		}
	},
	I: function () {
		return this.A.apply(this, arguments);
	},
	o: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			requestSimpleCommandUpdate();
			return openLine(c, c == 'o');
		}
		return inputEscape(o.e.fullIdentifier);
	},
	O: function () {
		return this.o.apply(this, arguments);
	},
	R: function (c, o) {
		if (prefixInput.isEmptyOperation && !buffer.selected) {
			requestInputMode('edit-overwrite');
			cursor.update({type:'edit-overwrite'});
			requestShowPrefixInput(getDefaultPrefixInputString());
			prefixInput.operation = c;
			prefixInput.isLocked = true;
			inputHandler.reset(prefixInput.count, '', buffer.selectionStart, true);
			editLogger.open('edit-wrapper');
			requestSimpleCommandUpdate();
		}
		else {
			inputEscape(o.e.fullIdentifier);
		}
		return false;
	},
	// equivalents to :& (repeat last executed :s)
	'&': function (c, o) {
		if (prefixInput.isEmptyOperation) {
			var range = [];
			range.push(buffer.selectionStartRow + 1);
			range.push(Math.min(range[0] + prefixInput.count - 1, buffer.rowLength));
			var result = executeExCommand(range.join(',') + '&');
			typeof result == 'string' && requestShowMessage(result, true);
			return true;
		}
		return inputEscape(o.e.fullIdentifier);
	},
	// S: substitute text for whole lines (equivalents to cc)
	S: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			prefixInput.operation = c;
			isVerticalMotion = true;
			return this.c['@op'].call(this, c, buffer);
		}
		return inputEscape(o.e.fullIdentifier);
	},
	// s: substitute characters
	s: function (c, o) {
		if (prefixInput.isEmptyOperation) {
			editLogger.open('substitute');
			deleteCharsForward(prefixInput.count, {yank:true});
			requestSimpleCommandUpdate();
			return startEdit(c);
		}
		return inputEscape(o.e.fullIdentifier);
	},
	// equivalents to :x
	//   ZZ
	Z: {
		'command': function (c, o) {
			if (prefixInput.isEmptyOperation) {
				prefixInput.operation = c;
				inputModeSub = 'wait-a-letter';
				requestShowPrefixInput();
			}
			else {
				inputEscape(o.e.fullIdentifier);
			}
			return false;
		},
		'wait-a-letter': function (c) {
			if (c == prefixInput.operation) {
				var result = executeExCommand('x');
				typeof result == 'string' && requestShowMessage(result, true);
				return true;
			}
			return inputEscape(prefixInput.operation);
		},
		'@op': function (c) {
			prefixInput.appendOperation(c);
		}
	},
	// ex command, everybody's favorite.
	':': {
		'command': function (c, o) {
			if (prefixInput.isEmptyOperation) {
				prefixInput.operation = c;
				lineInputHistories.defaultName = ':';
				requestInputMode('line-input', '', config.vars.prompt ? c : '');
			}
			else {
				inputEscape(o.e.fullIdentifier);
			}
			return false;
		},
		'line-input': function (c) {
			prefixInput.trailer = c;
			registers.set(':', c);
			lineInputHistories.push(c);
			if (!exCommandExecutor.onFinish) {
				exCommandExecutor.onFinish = function (executor) {
					executor.lastError && requestShowMessage(executor.lastError, true);
				};
			}
			var result = executeExCommand(c, true);
			if (typeof result == 'string') {
				requestShowMessage(result, true);
				return true;
			}
			else {
				return result;
			}
		}
	}



	/*
	 * not implemented
	 */

	// back to command mode
	/*'q': null,*/ /* not implemented */
	// back to command mode
	/*'Q': null,*/ /* not implemented */
	// ^^  return to previous file
	/*'\u001e': null,*/ /* not implemented */
	// ^]  takes word after cursor as tag
	/*'\u001d': null,*/ /* not implemented */
	// ^Z  suspend
	/*'\u001a': null,*/ /* not implemented */
	// filter through a command
	/*'!': null,*/ /* not implemented */
};

/*
 * insert mode mapping {{{1
 * ----------------
 */

var editMap = {
	'\u0000'/*^@*/: function (c) {
		inputHandler.ungetText();
		if (clipOverrun()) return;
		if (inputHandler.stroke.length) return;
		if (!registers.exists('.')) {
			requestShowMessage(_('Last inputted text is undefined.'), true);
			return;
		}
		var cmd = keyManager.createSequences(registers.get('.').data + '\u001b');
		for (var i = 0, goal = cmd.length; i < goal; i++) {
			processInput(cmd[i].code, cmd[i], true);
		}
	},
	'\u0004'/*^D*/: function (c) {
		inputHandler.ungetText();
		if (clipOverrun()) return;
		var needShift = c == '\u0014';
		var n = buffer.selectionStart;
		var re = /^([ \t]*).*?([0^]?)$/.exec(buffer.rows(n).substring(0, n.col));
		var tmpMark = 'edit-shifter';
		if (needShift || re) {
			inputHandler.flush();
			if (!needShift && re[2]) {
				n.col--;
				buffer.selectionStart = n;
				deleteSelection();
				marks.setPrivate(tmpMark, buffer.selectionStart);
				n.col = 0;
				buffer.selectionStart = n;
				n.col = re[1].length;
				buffer.selectionEnd = n;
				deleteSelection();
				buffer.setSelectionRange(marks.getPrivate(tmpMark));
				marks.setPrivate(tmpMark);
				re[2] == '^' && buffer.rowNodes(n).setAttribute('data-indent-ignore', '1');
			}
			else {
				marks.setPrivate(tmpMark, buffer.selectionStart);
				(needShift ? shift : unshift)();
				buffer.setSelectionRange(marks.getPrivate(tmpMark));
				marks.setPrivate(tmpMark);
			}
			inputHandler.invalidateHeadPosition();
		}
	},
	'\u0008'/*^H, backspace*/: function (c) {
		inputHandler.ungetText();

		if (buffer.selectionStartRow == 0 && buffer.selectionStartCol == 0) {
			requestShowMessage(_('Top of text.'), true);
			inputHandler.ungetStroke();
			return;
		}

		function selectNewline () {
			if (buffer.selectionStartCol == 0) {
				var p = buffer.selectionStart;
				p.row--;
				p = buffer.getLineTailOffset(p);
				buffer.selectionStart = p;
				return true;
			}
			return false;
		}

		function backToPrevWord () {
			if (selectNewline()) return;
			motionPrevWord(c, 1, false, [
				inputHandler.getStartPosition(),
				new Position(buffer.selectionStartRow, 0)
			]);
		}

		function backToStartPosition () {
			if (selectNewline()) return;

			var start = inputHandler.getStartPosition();
			var n = new Position(buffer.selectionStartRow, 0);
			var n2 = buffer.getLineTopOffset2(buffer.selectionStart);

			if (config.vars.autoindent && buffer.selectionStartCol > n2.col) {
				n = n2;
			}
			if (start.lt(buffer.selectionStart) && start.gt(n)) {
				n = start;
			}
			else {
				inputHandler.setStartPosition(n);
			}

			buffer.selectionStart = n;
		}

		inputHandler.flush();
		if (inputMode == 'edit-overwrite' &&
		buffer.selectionStart.le(inputHandler.getStartPosition())) {
			switch (c) {
			case '\u0008':
				motionLeft(c, 1);
				break;
			case '\u0015':
				backToStartPosition();
				break;
			case '\u0017':
				backToPrevWord();
				break;
			}
		}
		else {
			switch (c) {
			case '\u0008':
				deleteCharsBackward(1, {canJoin:true});
				break;
			case '\u0015':
				backToStartPosition();
				deleteSelection();
				break;
			case '\u0017':
				backToPrevWord();
				deleteSelection();
				break;
			}
			inputHandler.invalidateHeadPosition();
		}
	},
	'\u007f'/*delete*/: function (c) {
		inputHandler.ungetText();
		if (clipOverrun()) return;
		if (buffer.selectionStartRow >= buffer.rowLength - 1 &&
		buffer.selectionStartCol >= buffer.getLineTailOffset(buffer.selectionStartRow).col) {
			requestShowMessage(_('Tail of text.'), true);
			inputHandler.ungetStroke();
			return;
		}
		inputHandler.flush();
		deleteCharsForward(1, {canJoin:true});
		inputHandler.invalidateHeadPosition();
	},
	'\u0014'/*^T*/: function (c) {
		this['\u0004'].apply(this, arguments);
	},
	'\u0015'/*^U*/: function (c) {
		this['\u0008'].apply(this, arguments);
	},
	'\u0009'/*^I, tab*/: function (c) {
		if (clipOverrun()) return;
		insert('\t');
	},
	'\u000a'/*^J*/: function (c) {
		this['\u000d'].apply(this, arguments);
	},
	'\u000d'/*^M, enter*/: function (c) {
		if (clipOverrun()) return;
		var indent = config.vars.autoindent ? buffer.getIndent(buffer.selectionStart) : '';
		if (indent != '') {
			inputHandler.text += indent;
			inputHandler.textFragment += indent;
		}
		insert('\n' + indent);
	},
	'\u0016'/*^V*/: {
		'edit': function (c, o) {
			inputHandler.ungetText();
			if (clipOverrun()) return;
			inputModeSub = 'wait-a-letter';
			requestShowPrefixInput(_('{0}: literal input', o.e.fullIdentifier));
			literalInput = new Wasavi.LiteralInput;
			inputHandler.pushText();
			inputHandler.pushStroke();
		},
		'edit-overwrite': function (c, o) {
			this['\u0016'].edit.apply(this, arguments);
		},
		'wait-a-letter': function (c) {
			var result = literalInput.process(c);
			if (!result) {
				requestShowPrefixInput(literalInput.message);
				inputModeSub = 'wait-a-letter';
				isLastKeyCodeLocked = true;
				return;
			}
			if (result.error) {
				requestShowMessage(result.error, true);
				inputHandler.popStroke();
				inputHandler.ungetStroke();
				inputHandler.popText();
			}
			else {
				inputHandler.popText();

				if (result.sequence) {
					for (var i = 0, goal = result.sequence.length; i < goal; i++) {
						var ch = result.sequence[i];
						var code = ch.charCodeAt(0);
						var e = keyManager.objectFromCode(code);

						inputHandler.updateText(e);
						if (code == 10 || code == 13) {
							insert('\n');
						}
						else {
							if (code >= 0 && code != 9 && code <= 31 || code == 0x7f) {
								ch = toVisibleControl(code);
							}
							(inputMode == 'edit' ? insert : overwrite)(ch);
						}
					}
					cursor.ensureVisible();
					cursor.update();
					requestShowPrefixInput(getDefaultPrefixInputString());
				}
				else {
					inputHandler.popStroke();
					inputHandler.ungetStroke();
				}
				if (result.trail) {
					inputHandler.ungetStroke();
					var e = keyManager.objectFromCode(result.trail.charCodeAt(0));
					processInput(e.code, e);
				}
			}
			literalInput = null;
			isLastKeyCodeLocked = false;
		}
	},
	'\u0017'/*^W*/: function (c) {
		this['\u0008'].apply(this, arguments);
	},
	'<left>': function (c) {
		inputHandler.newState();
		motionLeft(c, 1);
	},
	'<up>': function (c) {
		inputHandler.newState();
		motionUp(c, 1);
	},
	'<right>': function (c) {
		inputHandler.newState();
		motionRight(c, 1);
	},
	'<down>': function (c) {
		inputHandler.newState();
		motionDown(c, 1);
	},
	'<home>': function (c) {
		inputHandler.newState();
		motionLineStart(c, false);
	},
	'<end>': function (c) {
		inputHandler.newState();
		motionLineEnd(c);
	},
	'<pageup>': function (c) {
		inputHandler.newState();
		scrollView(c, function (v) {
			return -(Math.max(parseInt(v.lines - 2), 1));
		});
	},
	'<pagedown>': function (c) {
		inputHandler.newState();
		scrollView(c, function (v) {
			return Math.max(parseInt(v.lines - 2), 1);
		});
	}
};

/*
 * line input mode mapping {{{1
 * ----------------
 */

var lineInputEditMap = {
	'\u0001'/*^A*/: function (c, o) {
		o.target.selectionStart = o.target.selectionEnd = 0;
		keyManager.init(o.target);
	},
	'\u0002'/*^B*/: function (c, o) {
		o.target.selectionStart = o.target.selectionEnd = Math.max(0, o.target.selectionStart - 1);
		keyManager.init(o.target);
	},
	'\u0005'/*^E*/: function (c, o) {
		o.target.selectionStart = o.target.selectionEnd = o.target.value.length;
		keyManager.init(o.target);
	},
	'\u0006'/*^F*/: function (c, o) {
		o.target.selectionStart = o.target.selectionEnd =
			Math.min(o.target.value.length, o.target.selectionEnd + 1);
		keyManager.init(o.target);
	},
	'\u0008'/*^H, backspace*/: function (c, o) {
		if (o.target.selectionStart == o.target.selectionEnd) {
			var n = Math.max(o.target.selectionStart - 1, 0);
			o.target.value = o.target.value.substring(0, n) +
				o.target.value.substring(o.target.selectionEnd);
			o.target.selectionStart = o.target.selectionEnd = n;
		}
		else {
			o.target.value = o.target.value.substring(0, o.target.selectionStart) +
				o.target.value.substring(o.target.selectionEnd);
			o.target.selectionEnd = o.target.selectionStart;
		}
		lineInputHistories.isInitial = true;
		keyManager.init(o.target);
	},
	'\u0009'/*^I, tab*/: function (c, o) {
		// TODO: some completion?
		lineInputHistories.isInitial = true;
	},
	'\u007f'/*delete*/: function (c, o) {
		if (o.target.selectionStart == o.target.selectionEnd) {
			var n = Math.max(o.target.selectionStart, o.target.value.length - 1);
			o.target.value = o.target.value.substring(0, o.target.selectionStart) +
				o.target.value.substring(o.target.selectionEnd + 1);
			o.target.selectionStart = o.target.selectionEnd = n;
		}
		else {
			o.target.value = o.target.value.substring(0, o.target.selectionStart) +
				o.target.value.substring(o.target.selectionEnd);
			o.target.selectionEnd = o.target.selectionStart;
		}
		lineInputHistories.isInitial = true;
	},
	'\u000e'/*^N*/: function (c, o) {
		if (lineInputHistories.isInitial) {
			requestRegisterNotice(_('Tail of history.'));
		}
		else {
			var line = lineInputHistories.next();
			if (line == undefined) {
				line = dataset(o.target, 'wasaviLineInputCurrent');
			}
			if (line == undefined) {
				requestRegisterNotice(_('Invalid history item.'));
			}
			else {
				o.target.value = line;
				o.target.selectionStart = line.length;
				o.target.selectionEnd = line.length;
				keyManager.init(o.target);
			}
		}
	},
	'\u0010'/*^P*/: function (c, o) {
		if (lineInputHistories.isInitial) {
			dataset(o.target, 'wasaviLineInputCurrent', o.target.value);
		}
		var line = lineInputHistories.prev();
		if (line == undefined) {
			requestRegisterNotice(_('Top of history.'));
		}
		else {
			o.target.value = line;
			o.target.selectionStart = line.length;
			o.target.selectionEnd = line.length;
			keyManager.init(o.target);
		}
	},
	'\u0015'/*^U*/: function (c, o) {
		o.target.value = '';
		o.target.selectionStart = o.target.selectionEnd = 0;
		lineInputHistories.isInitial = true;
		keyManager.init(o.target);
	},
	'\u0016'/*^V*/: {
		'line-input': function (c, o) {
			inputModeSub = 'wait-a-letter';
			literalInput = new Wasavi.LiteralInput;
			inputHandler.ungetText();
			inputHandler.pushText();
			inputHandler.pushStroke();
		},
		'wait-a-letter': function (c, o) {
			var result = literalInput.process(c);
			if (!result) {
				inputModeSub = 'wait-a-letter';
				isLastKeyCodeLocked = true;
				return;
			}
			if (result.error) {
				requestRegisterNotice();
				inputHandler.popStroke();
				inputHandler.ungetStroke();
				inputHandler.popText();
			}
			else {
				inputHandler.popText();

				if (result.sequence) {
					for (var i = 0, goal = result.sequence.length; i < goal; i++) {
						var ch = result.sequence[i];
						var code = ch.charCodeAt(0);
						var e = keyManager.objectFromCode(code);

						inputHandler.updateText(e);
						if (code == 10) {
							requestRegisterNotice();
							break;
						}
						if (code >= 0 && code <= 31 || code == 0x7f) {
							ch = toVisibleControl(code);
						}
						insertToLineInput(o.target, ch);
						keyManager.init(o.target);
					}
				}
				else {
					inputHandler.popStroke();
					inputHandler.ungetStroke();
				}
				if (result.trail) {
					inputHandler.ungetStroke();
					insertToLineInput(o.target, result.trail);
				}
			}
			literalInput = null;
			isLastKeyCodeLocked = false;
			lineInputHistories.isInitial = true;
		}
	},
	'\u0017'/*^W*/: function (c, o) {
		if (o.target.selectionStart == o.target.selectionEnd) {
			var re = /\b(\w+|\W+)$/.exec(o.target.value.substring(0, o.target.selectionStart));
			if (re) {
				var n = Math.max(o.target.selectionStart - re[0].length, 0);
				o.target.value = o.target.value.substring(0, n) +
					o.target.value.substring(o.target.selectionEnd);
				o.target.selectionStart = o.target.selectionEnd = n;
			}
		}
		else {
			o.target.value = o.target.value.substring(0, o.target.selectionStart) +
				o.target.value.substring(o.target.selectionEnd);
			o.target.selectionEnd = o.target.selectionStart;
		}
		lineInputHistories.isInitial = true;
		keyManager.init(o.target);
	},
	'<left>': function () {
		this['\u0002'].apply(this, arguments);
	},
	'<right>': function (c) {
		this['\u0006'].apply(this, arguments);
	},
	'<up>': function () {
		this['\u0010'].apply(this, arguments);
	},
	'<down>': function () {
		this['\u000e'].apply(this, arguments);
	},
	'<home>': function () {
		this['\u0001'].apply(this, arguments);
	},
	'<end>': function () {
		this['\u0005'].apply(this, arguments);
	}
};

/*
 * startup {{{1
 * ----------------
 */

if (global.WasaviExtensionWrapper
&&  WasaviExtensionWrapper.CAN_COMMUNICATE_WITH_EXTENSION
&&  WasaviExtensionWrapper.framePageUrl.isAny) {
	extensionChannel = WasaviExtensionWrapper.create();
	extensionChannel.setMessageListener(function (req) {
		if (!req) return;
		function run (callback) {
			function doRun () {
				/*
				 * an issue of security risk about innerHTML
				 * =========================================
				 * Assigning a string to innerHTML may cause security risk.
				 * But in this code, 'wasaviFrame' content is the resource
				 * within extension package at all the time, and not be manipulated
				 * from the outside.
				 * Thus we leave innerHTML.
				 */
				document.body.innerHTML = wasaviFrame;
				wasaviFrame = '';
				callback();
			}
			if (document.readyState == 'interactive' || document.readyState == 'complete') {
				doRun();
			}
			else {
				document.addEventListener('DOMContentLoaded', function handleDCL (e) {
					document.removeEventListener(e.type, handleDCL, false);
					doRun();
				}, false);
			}
		}
		switch (req.type) {
		case 'init-response':
			exrc = req.exrc + '\n' + req.ros;
			fontFamily = req.fontFamily;
			quickActivation = req.quickActivation;
			l10n = new Wasavi.L10n(appProxy, req.messageCatalog);
			global._ = l10n.getTranslator();
			testMode = req.testMode;
			devMode = req.devMode;
			wasaviFrame = req.wasaviFrame;
			ffttDictionary = new unicodeUtils.FfttDictionary(req.unicodeDictData.fftt);
			lineBreaker = new unicodeUtils.LineBreaker(req.unicodeDictData.LineBreak);
			fstab = req.fstab;
			version = req.version;
			document.documentElement.setAttribute('lang', l10n.getMessage('wasavi_locale_code'));
			if (WasaviExtensionWrapper.isTopFrame) {
				run(function() {
					!targetElement && install({
						id:'wasavi',
						nodeName:'textarea',
						value:'',
						selectionStart:0,
						selectionEnd:0,
						scrollTop:0,
						scrollLeft:0,
						readOnly:false,
						type:'textarea',
						rect:{
							width:document.documentElement.clientWidth,
							height:document.documentElement.clientHeight
						},
						fontStyle:'normal normal normal medium/1 "Consolas"',
						borderStyle:'',
						paddingStyle:'0',
						dataset:{},
						getAttribute: function (name) {return this.dataset[name];},
						setAttribute: function (name, value) {this.dataset[name] = value;}
					});
				});
			}
			else {
				if (!req.payload) break;
				testMode = req.payload.testMode;
				req.payload.dataset = {};
				req.payload.getAttribute = function (name) {return this.dataset[name];};
				req.payload.setAttribute = function (name, value) {this.dataset[name] = value;};
				run(function() {install(req.payload);});
			}
			break;
		}
	});
	extensionChannel.connect();
}

})(this);

// vim:set ts=4 sw=4 fenc=UTF-8 ff=unix ft=javascript fdm=marker :
