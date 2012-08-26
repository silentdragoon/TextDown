// MarkdownEditor.js by João Colombo
// I will doc this soon, see how it work on app.js or example.html
// http://joaocolombo.com
HTMLTextAreaElement.prototype.getCaretPosition = function () { //return the caret position of the textarea
    return this.selectionStart;
}
HTMLTextAreaElement.prototype.setCaretPosition = function (position) { //change the caret position of the textarea
    this.selectionStart = position;
    this.selectionEnd = position;
    this.focus();
}
HTMLTextAreaElement.prototype.hasSelection = function () { //if the textarea has selection then return true
    if(this.selectionStart == this.selectionEnd) {
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
var MarkdownEditorOnTextArea = function (textarea) { //fast usage
    var me = new MarkdownEditor();
    me.textarea = textarea;
    me.run();
    return textarea;
}
//our markdown editor
var MarkdownEditor = function () {
    var me = this;
    var converter = new Showdown.converter().makeHtml; //our showdown converter
    var updatePreviewTimer; //we need this little timer for update the preview on live preview when text is big
    this.run = function () {
        me.html = me.getHTML();
        me.textarea.onfocus = function () {
            me.textarea.isOnFocus = 1;
        }
        me.textarea.onblur = function () {
            me.textarea.isOnFocus = 0;
        }
        me.textarea.onkeyup = function (event) {
            //auto pair 
            if(!event.shiftKey && event.keyCode == 219) { //auto pair for "["
                var newCaretPosition = me.textarea.getCaretPosition();
                me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "]" + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                me.textarea.setCaretPosition(newCaretPosition);
            } else if(!event.shiftKey && event.keyCode == 221) { //fix when user types "]" after "["
                if(me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition() - 1) == "[" && me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.getCaretPosition() + 1) == "]") {
                    var newCaretPosition = me.textarea.getCaretPosition() - 1;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + me.textarea.value.substring(me.textarea.getCaretPosition() + 1, me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if(!event.ctrlKey && event.shiftKey && event.keyCode == 56) { //auto pair for "*"
                var newCaretPosition = me.textarea.getCaretPosition();
                me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "*" + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                me.textarea.setCaretPosition(newCaretPosition);
            } else if(event.keyCode == 32) { //space
                if(me.textarea.value.substring(me.textarea.getCaretPosition() - 3, me.textarea.getCaretPosition()) == "\n* ") {
                    var newCaretPosition = me.textarea.getCaretPosition();
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + me.textarea.value.substring(me.textarea.getCaretPosition() + 1, me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                } else if(me.textarea.value.substring(me.textarea.getCaretPosition() - 4, me.textarea.getCaretPosition()) == "\n*  " || me.textarea.value.substring(me.textarea.getCaretPosition() - 4, me.textarea.getCaretPosition()) == "\n+  " || me.textarea.value.substring(me.textarea.getCaretPosition() - 4, me.textarea.getCaretPosition()) == "\n-  ") {
                    var newCaretPosition = me.textarea.getCaretPosition() - 1;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition() - 1) + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if(!event.ctrlKey && event.shiftKey && event.keyCode == 189) { //auto pair for "_"
                var newCaretPosition = me.textarea.getCaretPosition();
                me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "_" + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                me.textarea.setCaretPosition(newCaretPosition);
            } else if(!event.ctrlKey && event.shiftKey && event.keyCode == 57) { //auto pair for "("
                var newCaretPosition = me.textarea.getCaretPosition();
                me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + ")" + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                me.textarea.setCaretPosition(newCaretPosition);
            } else if(event.shiftKey && event.keyCode == 48) { //fix when user types ")" after "("
                if(me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition() - 1) == "(" && me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.getCaretPosition() + 1) == ")") {
                    var newCaretPosition = me.textarea.getCaretPosition() - 1;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + me.textarea.value.substring(me.textarea.getCaretPosition() + 1, me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if(!event.ctrlKey && event.shiftKey && event.keyCode == 190) { //place space after ">"
                if(me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition() - 1) == "" || me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition() - 1) == "\n") {
                    var newCaretPosition;
                    newCaretPosition = me.textarea.getCaretPosition() + 1;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + " " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                } else if(me.textarea.value.substring(me.textarea.getCaretPosition() - 3, me.textarea.getCaretPosition() - 1) == "> ") {
                    var newCaretPosition;
                    newCaretPosition = me.textarea.getCaretPosition();
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition() - 2) + "> " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if(!event.shiftKey && event.keyCode == 189) { //place space after "-"
                if(me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition() - 1) == "" || me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition() - 1) == "\n") {
                    var newCaretPosition;
                    newCaretPosition = me.textarea.getCaretPosition() + 1;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + " " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if(event.shiftKey && event.keyCode == 187) { //place space after "+"
                if(me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition() - 1) == "" || me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition() - 1) == "\n") {
                    var newCaretPosition;
                    newCaretPosition = me.textarea.getCaretPosition() + 1;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + " " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if(!event.ctrlKey && event.shiftKey && event.keyCode == 51) { //place space after header
                if(me.textarea.value.substring(0, me.textarea.getCaretPosition()).lastIndexOf("#") - me.textarea.value.substring(0, me.textarea.getCaretPosition()).lastIndexOf("\n") <= 7) {
                    if(me.textarea.value.substring(me.textarea.getCaretPosition() - 3, me.textarea.getCaretPosition() - 1) == "# ") {
                        var newCaretPosition;
                        newCaretPosition = me.textarea.getCaretPosition();
                        me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition() - 2) + "# " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                        me.textarea.setCaretPosition(newCaretPosition);
                    } else {
                        var newCaretPosition;
                        newCaretPosition = me.textarea.getCaretPosition() + 1;
                        me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + " " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                        me.textarea.setCaretPosition(newCaretPosition);
                    }
                }
            }
            if(me.textarea.onKeyUp != undefined) { //excute custom functions
                me.textarea.onKeyUp(event);
            }
            if(me.isLivePreview) { //live preview 
                if(me.textarea.value.length < 3000) { //can preview every keyup
                    me.updatePreview();
                } else { //get down a little bit to not be slow when theres is a lot of text to convert
                    if(updatePreviewTimer) {
                        window.clearTimeout(updatePreviewTimer);
                    }
                    updatePreviewTimer = window.setTimeout(function () {
                        me.updatePreview();
                    }, 100);
                }
            }
        }
        me.textarea.onkeydown = function (event) {
            if(me.textarea.onKeyDown != undefined) { //excute custom functions
                me.textarea.onKeyDown(event);
            }
            if(event.keyCode == 9) { //tab support
                if((me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.getCaretPosition() + 1) == "" || me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.getCaretPosition() + 1) == "\n") && (me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition()) == "* " || me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition()) == "+ " || me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition()) == "- ")) { //tab when it's "- " or "> "
                    me.textarea.setCaretPosition(me.textarea.getCaretPosition() - 2);
                    var newCaretPosition = me.textarea.getCaretPosition() + "    ".length + 2;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "    " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                    return false;
                } else {
                    var newCaretPosition = me.textarea.getCaretPosition() + "    ".length;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "    " + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                }
                return false;
            } else if(event.keyCode == 37) { //left arrow
                if(me.textarea.value.substring(me.textarea.getCaretPosition() - 4, me.textarea.getCaretPosition()) == "    ") { //it's a tab space
                    var newCaretPosition;
                    newCaretPosition = me.textarea.getCaretPosition() - 3;
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if(event.keyCode == 39) { //right arrow
                if(me.textarea.value.substring(me.textarea.getCaretPosition() + 4, me.textarea.getCaretPosition()) == "    ") { //it's a tab space
                    var newCaretPosition;
                    newCaretPosition = me.textarea.getCaretPosition() + 3;
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if(event.keyCode == 8) { //smart backspace
                //console.log(me.textarea.value.substring(me.textarea.getCaretPosition() - 5, me.textarea.getCaretPosition() - 1));
                if(me.textarea.value.substring(me.textarea.getCaretPosition() - 4, me.textarea.getCaretPosition()) == "    ") { //it's a tab space
                    var newCaretPosition = me.textarea.getCaretPosition() - 3;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition() - 3) + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                } else if(me.textarea.value.substring(me.textarea.getCaretPosition() - 5, me.textarea.getCaretPosition() - 1) == "   +" || me.textarea.value.substring(me.textarea.getCaretPosition() - 5, me.textarea.getCaretPosition() - 1) == "   *" || me.textarea.value.substring(me.textarea.getCaretPosition() - 5, me.textarea.getCaretPosition() - 1) == "   -") { // /* review */ it's a sublist item
                    var newCaretPosition = me.textarea.getCaretPosition() - 4;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition() - 6) + me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                    return false;
                } else if((me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.getCaretPosition() + 1) == "" || me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.getCaretPosition() + 1) == "\n") && (me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition()) == "* " || me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition()) == "+ " || me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition()) == "> " || me.textarea.value.substring(me.textarea.getCaretPosition() - 2, me.textarea.getCaretPosition()) == "- ")) { //it's "- " or "> "
                    var newCaretPosition = me.textarea.getCaretPosition() - 1;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition() - 1) + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                } else if(me.textarea.value.substring(me.textarea.getCaretPosition() - 1, me.textarea.getCaretPosition() + 1) == "()" || me.textarea.value.substring(me.textarea.getCaretPosition() - 1, me.textarea.getCaretPosition() + 1) == "[]" || me.textarea.value.substring(me.textarea.getCaretPosition() - 1, me.textarea.getCaretPosition() + 1) == "**" || me.textarea.value.substring(me.textarea.getCaretPosition() - 1, me.textarea.getCaretPosition() + 1) == "__") { //it's "()" or "[]" or "**"
                    var newCaretPosition = me.textarea.getCaretPosition();
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + me.textarea.value.substring(me.textarea.getCaretPosition() + 1, me.textarea.value.length);
                    me.textarea.setCaretPosition(newCaretPosition);
                }
            } else if(!event.shiftKey && !event.ctrlKey && event.keyCode == 13) { //return key 
                if(!me.textarea.hasSelection()) {
                    var check = false;
                    var input = me.textarea.value.replace(/\r\n/g, '\n');
                    var start = me.textarea.getCaretPosition();
                    var lines = input.split('\n');
                    var state = input.substr(0, start).split('\n').length;
                    var value = lines[state - 1].replace(/^\s+/, '');
                    var first = value.substr(0, 2);
                    var begin;
                    if(value && !check && lines[state - 1].substr(0, 4) == '    ') { //code
                        var i = 0;
                        var numberOfSpaces;
                        do {
                            if(lines[state - 1].charAt(i) == " ") {
                                i++;
                            } else {
                                numberOfSpaces = i;
                                i = lines[state - 1];
                            }
                        } while (i <= lines[state - 1].length);
                        begin = label = lines[state - 1].substr(0, numberOfSpaces);
                        check = true;
                    }
                    if(['* ', '+ ', '- ', '> '].indexOf(first) >= 0) { //lists and quote
                        begin = label = first;
                        check = true;
                    }
                    if(check) {
                        var newCaretPosition;
                        var width = lines[state - 1].indexOf(begin);
                        if(value.replace(/^\s+/, '') == begin) {
                            me.textarea.value = input.substr(0, start - 1 - width - label.length) + '\n\n' + input.substr(start, input.length);
                            newCaretPosition = start + 1 - label.length - width;
                        } else {
                            me.textarea.value = input.substr(0, start) + '\n' + (new Array(width + 1).join(' ')) + label + input.substr(start, input.length);
                            newCaretPosition = start + 1 + label.length + width;
                        }
                        me.textarea.setCaretPosition(newCaretPosition);
                        if(lines[state] == lines[lines.length]) {
                            me.textarea.scrollTop = me.textarea.scrollHeight;
                        }
                        return false;
                    }
                }
            }
        }
        if(me.isLivePreview) { //first preview if is live preview
            me.updatePreview();
        }
    }
    this.wrapTextWithString = function (string) {
        if(me.textarea.hasSelection()) {
            var newSelection = [];
            newSelection[0] = me.textarea.getCaretPosition();
            newSelection[1] = me.textarea.getCaretPosition() + me.textarea.getSelectedText().length + (string.length * 2);
            me.textarea.value = me.textarea.value.substring(0, me.textarea.selectionStart) + string + me.textarea.getSelectedText() + string + me.textarea.value.substring(me.textarea.selectionEnd, me.textarea.value.length);
            me.textarea.setSelection(newSelection[0], newSelection[1]);
        } else {
            var newCaretPosition;
            newCaretPosition = me.textarea.getCaretPosition() + string.length;
            me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + string + string + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
            me.textarea.setCaretPosition(newCaretPosition);
        }
        if(me.isLivePreview) {
            me.updatePreview();
        }
    }
    this.addLink = function () {
        var newSelection = [];
        var ok;
        if(me.textarea.hasSelection()) {
            var userInput;
            if(isURL(me.textarea.getSelectedText())) {
                userInput = prompt("Enter the Link Title", me.textarea.getSelectedText());
                if(userInput) {
                    ok = 1;
                    newSelection[0] = me.textarea.getCaretPosition();
                    newSelection[1] = me.textarea.getCaretPosition() + userInput.length + me.textarea.getSelectedText().length + 4;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.selectionStart) + "[" + userInput + "](" + me.textarea.getSelectedText() + ")" + me.textarea.value.substring(me.textarea.selectionEnd, me.textarea.value.length);
                }
            } else {
                userInput = prompt("Enter the Link Adress", "http://");
                if(userInput) {
                    ok = 1;
                    newSelection[0] = me.textarea.getCaretPosition();
                    newSelection[1] = me.textarea.getCaretPosition() + userInput.length + me.textarea.getSelectedText().length + 4;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.selectionStart) + "[" + me.textarea.getSelectedText() + "](" + userInput + ")" + me.textarea.value.substring(me.textarea.selectionEnd, me.textarea.value.length);
                }
            }
        } else {
            var url;
            url = prompt("Enter the Link Adress", 'http://');
            if(url) {
                ok = 1;
                newSelection[0] = me.textarea.getCaretPosition();
                newSelection[1] = me.textarea.getCaretPosition() + url.length + 4;
                me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "[](" + url + ")" + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
            }
        }
        if(ok) {
            me.textarea.setSelection(newSelection[0], newSelection[1]);
            if(me.isLivePreview) {
                me.updatePreview();
            }
        } else { //if the user clicked on cancel then focus the textarea
            if(me.textarea.hasSelection()) {
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
    this.addImage = function () {
        var newSelection = [];
        var ok;
        if(me.textarea.hasSelection()) {
            var userInput;
            if(isImageURL(me.textarea.getSelectedText())) {
                userInput = prompt("Enter the Image Adress", me.textarea.getSelectedText());
                if(userInput) {
                    ok = 1;
                    newSelection[0] = me.textarea.getCaretPosition();
                    newSelection[1] = me.textarea.getCaretPosition() + userInput.length + me.textarea.getSelectedText().length + 5;
                    me.textarea.value = textarea.value.substring(0, me.textarea.selectionStart) + "![" + userInput + "](" + me.textarea.getSelectedText() + ")" + me.textarea.value.substring(me.textarea.selectionEnd, me.textarea.value.length);
                }
            } else {
                userInput = prompt("Enter the image Alt Text", "http://");
                if(userInput) {
                    ok = 1;
                    newSelection[0] = me.textarea.getCaretPosition();
                    newSelection[1] = me.textarea.getCaretPosition() + userInput.length + me.textarea.getSelectedText().length + 5;
                    me.textarea.value = me.textarea.value.substring(0, me.textarea.selectionStart) + "![" + me.textarea.getSelectedText() + "](" + userInput + ")" + me.textarea.value.substring(me.textarea.selectionEnd, me.textarea.value.length);
                }
            }
        } else {
            var url;
            url = prompt("Enter the Image Adress", 'http://');
            if(url) {
                ok = 1;
                newSelection[0] = me.textarea.getCaretPosition();
                newSelection[1] = me.textarea.getCaretPosition() + url.length + 5;
                me.textarea.value = me.textarea.value.substring(0, me.textarea.getCaretPosition()) + "![](" + url + ")" + me.textarea.value.substring(me.textarea.getCaretPosition(), me.textarea.value.length);
            }
        }
        if(ok) {
            me.textarea.setSelection(newSelection[0], newSelection[1]);
            if(me.isLivePreview) {
                me.updatePreview();
            }
        } else { //if the user clicked on cancel then focus the textarea
            if(me.textarea.hasSelection()) {
                me.textarea.setSelection(me.textarea.selectionStart, me.textarea.selectionEnd);
            } else {
                me.textarea.setCaretPosition(me.textarea.getCaretPosition());
            }
        }
    }

    function isImageURL(url) { //check if is a image url or not
        if(isURL(url)) {
            var regExp = /(png|gif|jpg|xbm|svg|jpeg)/i
            return regExp.test(url.split(".")[url.split(".").length - 1]);
        } else {
            return false;
        }
    }
    this.updatePreview = function () {
        me.html = me.getHTML();
        me.preview.innerHTML = me.html;
        if(me.onPreview != undefined) { //excute custom functions
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