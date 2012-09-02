//MarkdownEditor.js by João Colombo
//I will doc this soon, see how it works on app.js or example.html
//http://joaocolombo.com
var MarkdownEditor = function () {

    var me = this; //the markdowne editor
    var converter = new Showdown.converter().makeHtml; //our showdown converter
    var updatePreviewTimer; //we need this little timer for update the preview on live preview when text is big

    this.run = function () {

        me.html = me.getHTML();

        me.textarea.addEventListener("blur", function () {
            me.textarea.isOnFocus = 1;
        }, false);
        me.textarea.addEventListener("blur", function () {
            me.textarea.isOnFocus = 0;
        }, false);

        //good undo function
        var undoArray = [];
        var hasCmdKey = (navigator.appVersion.indexOf("Mac") == -1) ? false : true;
        Array.prototype.isArray = true;
        me.textarea.undo = function () {
            if (undoArray.length > 0) {
                me.textarea.value = undoArray[undoArray.length - 1][0];
                if (undoArray[undoArray.length - 1][1].isArray) {
                    me.textarea.setSelection(undoArray[undoArray.length - 1][1][0], undoArray[undoArray.length - 1][1][1]);
                } else {
                    me.textarea.setCaretPosition(undoArray[undoArray.length - 1][1]);
                }
                undoArray.pop();
            }
        }
        me.textarea.saveUndo = function () {
            if (me.textarea.hasSelection()) {
                undoArray[undoArray.length] = [me.textarea.value, [me.textarea.selectionStart, me.textarea.selectionEnd]];
            } else {
                undoArray[undoArray.length] = [me.textarea.value, me.textarea.getCaretPosition()];
            }
        }
        me.textarea.addEventListener("keypress", function (event) {
            if (event.ctrlKey && String.fromCharCode(event.keyCode) == "z") {
                if (!hasCmdKey) { //is not on a mac
                    me.textarea.undo();
                } else {
                    me.textarea.saveUndo();
                }
            } else {
                me.textarea.saveUndo();
            }
        }, false);
        me.textarea.addEventListener("keydown", function (event) {
            if (hasCmdKey) { //is on a mac
                if (event.metaKey && String.fromCharCode(event.keyCode) == "Z") {
                    event.preventDefault();
                    me.textarea.undo();
                    me.textarea.undo();
                }
            }
        }, false);

        //keypress, keyup and keydown events
        me.textarea.addEventListener("keypress", function (event) {
            if (["[", "(", "*", "_", "\""].indexOf(String.fromCharCode(event.keyCode)) >= 0) { //auto-pair
                if (String.fromCharCode(event.keyCode) == "[") {
                    me.wrapTextWithString("[", "]");
                    event.preventDefault();
                } else if (String.fromCharCode(event.keyCode) == "(") {
                    me.wrapTextWithString("(", ")");
                    event.preventDefault();
                } else {
                    me.wrapTextWithString(String.fromCharCode(event.keyCode));
                    event.preventDefault();
                }
            } else if ((String.fromCharCode(event.keyCode) == ")" && me.textarea.value.substring(me.textarea.getCaretPosition() - 1, me.textarea.getCaretPosition()) == "(") || (String.fromCharCode(event.keyCode) == "]" && me.textarea.value.substring(me.textarea.getCaretPosition() - 1, me.textarea.getCaretPosition()) == "[")) { //fix when user types ")" after "(" or "[" after "]"
                event.preventDefault();
            } else if (["+", "-", "*"].indexOf(String.fromCharCode(event.keyCode)) >= 0 && ["", "\n"].indexOf(me.textarea.value.substring(me.textarea.getCaretPosition() - 1, me.textarea.getCaretPosition())) >= 0) { //place space after "+", "-" and "*" when it's a list item
                event.preventDefault();
                var newCaretPosition;
                newCaretPosition = me.textarea.getCaretPosition() + 2;
                me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + String.fromCharCode(event.keyCode) + " " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                me.textarea.setCaretPosition(newCaretPosition);
            } else if (String.fromCharCode(event.keyCode) == " ") { //space
                if (["()", "[]", "**", "__", "\"\""].indexOf(me.textarea.value.substring(me.textarea.getCaretPosition() - 1, me.textarea.getCaretPosition() + 1)) >= 0) { //delete the auto-pair
                    var newCaretPosition = me.textarea.getCaretPosition();
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + " " + me.textarea.value.substring(me.textarea.getCaretPosition() + 1, me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                } else if (["\n+ ", "\n* ", "\n- "].indexOf(me.textarea.value.substring(me.textarea.getCaretPosition() - 3, me.textarea.getCaretPosition())) >= 0) { //user typed space after list item that already had a space
                    event.preventDefault();
                }
            } else if (String.fromCharCode(event.keyCode) == "#") { //place space after # when it's a header
                if (me.textarea.value.substring(0, me.textarea.getCaretPosition()).lastIndexOf("#") - me.textarea.value.substring(0, me.textarea.getCaretPosition()).lastIndexOf("\n") <= 7) {
                    if (me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition()) == "# ") {
                        event.preventDefault();
                        var newCaretPosition;
                        newCaretPosition = me.textarea.getCaretPosition() + 1;
                        me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition() - 1) + "# " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                        me.textarea.setCaretPosition(newCaretPosition);
                    } else {
                        event.preventDefault();
                        var newCaretPosition;
                        newCaretPosition = me.textarea.getCaretPosition() + 2;
                        me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "# " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                        me.textarea.setCaretPosition(newCaretPosition);
                    }
                }
            }
        }, false);
        me.textarea.addEventListener("keyup", function (event) {
            if (me.isLivePreview) { //live preview
                me.updatePreview();
            }
        }, false);
        me.textarea.addEventListener("keydown", function (event) {
            if (String.fromCharCode(event.keyCode) == "\t") { //tab
                event.preventDefault();
                if (["", "\n"].indexOf(me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.getCaretPosition() + 1)) >= 0 && ["+ ", "* ", "- "].indexOf(me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition())) >= 0) { //tab when it's "+ ", * " or "- "
                    me.textarea.setCaretPosition(me.textarea.getCaretPosition() - 2);
                    var newCaretPosition = me.textarea.getCaretPosition() + "    ".length + 2;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "    " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                } else { //normal tab
                    var newCaretPosition = me.textarea.getCaretPosition() + "    ".length;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "    " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if (event.keyCode == 37 || event.keyCode == 39) { //left arrow for tab
                if (me.textarea.value.substring(me.textarea.getCaretPosition() - 4, me.textarea.getCaretPosition()) == "    ") { //it's a tab space
                    event.preventDefault();
                    var newCaretPosition;
                    if (event.keyCode == 37) { //left arrow
                        newCaretPosition = me.textarea.getCaretPosition() - 4;
                    } else { //right arrow
                        newCaretPosition = me.textarea.getCaretPosition() + 4;
                    }
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if (event.keyCode == 8) { //backspace
                if (me.textarea.value.substring(me.textarea.getCaretPosition() - 4, me.textarea.getCaretPosition()) == "    ") { //it's a tab space
                    event.preventDefault();
                    var newCaretPosition = me.textarea.getCaretPosition() - 4;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition() - 4) + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                } else if (["   *", "   +", "   -"].indexOf(me.textarea.value.substring(me.textarea.getCaretPosition() - 5, me.textarea.getCaretPosition() - 1)) >= 0) { // it's a sublist item
                    event.preventDefault();
                    var newCaretPosition = me.textarea.getCaretPosition() - 4;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition() - 6) + me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                } else if (["", "\n"].indexOf(me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.getCaretPosition() + 1)) >= 0 && ["+ ", "* ", "- "].indexOf(me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition())) >= 0) { //it's "+ ", * " or "- "
                    event.preventDefault();
                    var newCaretPosition = me.textarea.getCaretPosition() - 2;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition() - 2) + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                } else if (["()", "[]", "**", "__", "\"\""].indexOf(me.textarea.value.substring(me.textarea.getCaretPosition() - 1, me.textarea.getCaretPosition() + 1)) >= 0) { //it's "()" or "[]" or "**"
                    event.preventDefault();
                    var newCaretPosition = me.textarea.getCaretPosition() - 1;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition() - 1) + me.textarea.value.substring(me.textarea.getCaretPosition() + 1, me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if (!event.shiftKey && !event.ctrlKey && event.which == 13) { //return key
                /* based on https://github.com/jamiebicknell/Markdown-Helper */
                if (!me.textarea.hasSelection()) {
                    var check = false;
                    var input = me.textarea.value.replace(/\r\n/g, '\n');
                    var start = me.textarea.getCaretPosition();
                    var lines = input.split('\n');
                    var state = input.substr(0, start).split('\n').length;
                    var value = lines[state - 1].replace(/^\s+/, '');
                    var first = value.substr(0, 2);
                    var begin;
                    if (value && !check && lines[state - 1].substr(0, 4) == '    ') { //code
                        var i = 0;
                        var numberOfSpaces;
                        do {
                            if (lines[state - 1].charAt(i) == " ") {
                                i++;
                            } else {
                                numberOfSpaces = i;
                                i = lines[state - 1];
                            }
                        } while (i <= lines[state - 1].length);
                        begin = label = lines[state - 1].substr(0, numberOfSpaces);
                        check = true;
                    }
                    if (['* ', '+ ', '- ', '> '].indexOf(first) >= 0) { //lists and quote
                        begin = label = first;
                        check = true;
                    }
                    if (check) {
                        var newCaretPosition;
                        var width = lines[state - 1].indexOf(begin);
                        if (value.replace(/^\s+/, '') == begin) {
                            me.textarea.value = input.substr(0, start - 1 - width - label.length) + '\n\n' + input.substr(start, input.length);
                            newCaretPosition = start + 1 - label.length - width;
                        } else {
                            me.textarea.value = input.substr(0, start) + '\n' + (new Array(width + 1).join(' ')) + label + input.substr(start, input.length);
                            newCaretPosition = start + 1 + label.length + width;
                        }
                        me.textarea.setCaretPosition(newCaretPosition);
                        if (lines[state] == lines[lines.length]) {
                            me.textarea.scrollTop = me.textarea.scrollHeight;
                        }
                        event.preventDefault();
                    }
                }
            }
        }, false)

        if (me.isLivePreview) { //first preview if is live preview
            me.updatePreview();
        }
    }
    this.wrapTextWithString = function (string1, string2) {
        me.textarea.saveUndo();
        if (string2 == undefined) {
            string2 = string1;
        }
        if (me.textarea.hasSelection()) {
            var newSelection = [];
            newSelection[0] = me.textarea.getCaretPosition();
            newSelection[1] = me.textarea.getCaretPosition() + me.textarea.getSelectedText().length + string1.length + string2.length;
            me.textarea.value = me.textarea.value.substring(0, me.textarea.selectionStart) + string1 + me.textarea.getSelectedText() + string2 + me.textarea.value.substring(me.textarea.selectionEnd, me.textarea.value.length);
            me.textarea.setSelection(newSelection[0], newSelection[1]);
        } else {
            var newCaretPosition;
            newCaretPosition = me.textarea.getCaretPosition() + (string1.length + string2.length) / 2;
            me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + string1 + string2 + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
            me.textarea.setCaretPosition(newCaretPosition);
        }
        if (me.isLivePreview) {
            me.updatePreview();
        }
    }
    this.addLink = function () {
        var newSelection = [];
        var ok;
        if (me.textarea.hasSelection()) {
            var userInput;
            if (isURL(me.textarea.getSelectedText())) {
                userInput = prompt("Enter the Link Title", me.textarea.getSelectedText());
                if (userInput) {
                    me.textarea.saveUndo();
                    ok = 1;
                    newSelection[0] = me.textarea.getCaretPosition();
                    newSelection[1] = me.textarea.getCaretPosition() + userInput.length + me.textarea.getSelectedText().length + 4;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.selectionStart) + "[" + userInput + "](" + me.textarea.getSelectedText() + ")" + me.textarea.value.substring(me.textarea.selectionEnd, me.textarea.value.length);
                }
            } else {
                userInput = prompt("Enter the Link Adress", "http://");
                if (userInput) {
                    me.textarea.saveUndo();
                    ok = 1;
                    newSelection[0] = me.textarea.getCaretPosition();
                    newSelection[1] = me.textarea.getCaretPosition() + userInput.length + me.textarea.getSelectedText().length + 4;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.selectionStart) + "[" + me.textarea.getSelectedText() + "](" + userInput + ")" + me.textarea.value.substring(me.textarea.selectionEnd, me.textarea.value.length);
                }
            }
        } else {
            var url;
            url = prompt("Enter the Link Adress", 'http://');
            if (url) {
                me.textarea.saveUndo();
                ok = 1;
                newSelection[0] = me.textarea.getCaretPosition();
                newSelection[1] = me.textarea.getCaretPosition() + url.length + 4;
                me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "[](" + url + ")" + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
            }
        }
        if (ok) {
            me.textarea.setSelection(newSelection[0], newSelection[1]);
            if (me.isLivePreview) {
                me.updatePreview();
            }
        } else { //if the user clicked on cancel then focus the textarea
            if (me.textarea.hasSelection()) {
                me.textarea.setSelection(me.textarea.selectionStart, me.textarea.selectionEnd);
            } else {
                me.textarea.setCaretPosition(me.textarea.getCaretPosition());
            }
        }
    }
    this.addImage = function () {
        var newSelection = [];
        var ok;
        if (me.textarea.hasSelection()) {
            var userInput;
            if (isImageURL(me.textarea.getSelectedText())) {
                userInput = prompt("Enter the Image Adress", me.textarea.getSelectedText());
                if (userInput) {
                    ok = 1;
                    newSelection[0] = me.textarea.getCaretPosition();
                    newSelection[1] = me.textarea.getCaretPosition() + userInput.length + me.textarea.getSelectedText().length + 5;
                    me.textarea.value = textarea.value.substring(0, me.textarea.selectionStart) + "![" + userInput + "](" + me.textarea.getSelectedText() + ")" + me.textarea.value.substring(me.textarea.selectionEnd, me.textarea.value.length);
                }
            } else {
                userInput = prompt("Enter the image Alt Text", "http://");
                if (userInput) {
                    me.textarea.saveUndo();
                    ok = 1;
                    newSelection[0] = me.textarea.getCaretPosition();
                    newSelection[1] = me.textarea.getCaretPosition() + userInput.length + me.textarea.getSelectedText().length + 5;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.selectionStart) + "![" + me.textarea.getSelectedText() + "](" + userInput + ")" + me.textarea.value.substring(me.textarea.selectionEnd, me.textarea.value.length);
                }
            }
        } else {
            var url;
            url = prompt("Enter the Image Adress", 'http://');
            if (url) {
                me.textarea.saveUndo();
                ok = 1;
                newSelection[0] = me.textarea.getCaretPosition();
                newSelection[1] = me.textarea.getCaretPosition() + url.length + 5;
                me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "![](" + url + ")" + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
            }
        }
        if (ok) {
            me.textarea.setSelection(newSelection[0], newSelection[1]);
            if (me.isLivePreview) {
                me.updatePreview();
            }
        } else { //if the user clicked on cancel then focus the textarea
            if (me.textarea.hasSelection()) {
                me.textarea.setSelection(me.textarea.selectionStart, me.textarea.selectionEnd);
            } else {
                me.textarea.setCaretPosition(me.textarea.getCaretPosition());
            }
        }
    }

    function isURL(url) { //check if is an url or not
        var regExp = /(ftp|http|https|file):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i
        return regExp.test(url);
    }

    function isImageURL(url) { //check if is a image url or not
        if (isURL(url)) {
            var regExp = /(png|gif|jpg|xbm|svg|jpeg)/i
            return regExp.test(url.split(".")[url.split(".").length - 1]);
        } else {
            return false;
        }
    }
    this.updatePreview = function () {
        me.html = me.getHTML();
        me.preview.innerHTML = me.html;
        if (me.onPreview != undefined) { //excute custom functions
            me.onPreview();
        }
    }
    this.convert = function (text) { //convert markdown into html
        text = converter(text);
        return text;
    }
    this.getHTML = function () { //if you are not using the live preview use this method to get html
        return me.convert(me.textarea.value);
    }
    return this;
}

//TextArea caret and selection manipulation
HTMLTextAreaElement.prototype.getCaretPosition = function () { //return the caret position of the textarea
    return this.selectionStart;
}
HTMLTextAreaElement.prototype.setCaretPosition = function (position) { //change the caret position of the textarea
    this.selectionStart = position;
    this.selectionEnd = position;
    this.focus();
}
HTMLTextAreaElement.prototype.hasSelection = function () { //if the textarea has selection then return true
    if (this.selectionStart == this.selectionEnd) {
        return false;
    } else {
        return true;
    }
}
HTMLTextAreaElement.prototype.getSelectedText = function () { //return the selection text
    return this.value.substring(this.selectionStart, this.selectionEnd);
}
HTMLTextAreaElement.prototype.setSelection = function (start, end) { //change the selection area of the textarea
    this.selectionStart = start;
    this.selectionEnd = end;
    this.focus();
}