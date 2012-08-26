window.onload = function() {

    var editorPanel = document.getElementById("editorPanel");
    var textarea = document.getElementsByTagName("textarea")[0];
    var previewPanel = document.getElementById("previewPanel");
    var preview = document.getElementById("preview");
    var smartScroller = document.getElementById("smartScroller");
	
    var MDEditor = new MarkdownEditor();
    MDEditor.textarea = textarea;
    MDEditor.preview = preview;
    MDEditor.isLivePreview = 1;
    MDEditor.onPreview = function() {

        smartScroller.style.width = preview.offsetWidth + "px";
        smartScroller.innerHTML = MDEditor.convert(textarea.value.substring(0, textarea.getCaretPosition()));
        window.scrollTo(0, (smartScroller.offsetHeight - (16 * 2)) - parent.innerHeight / 2);
        smartScroller.innerHTML = "";

        adjustEditorPanelHeight();
    }
    MDEditor.textarea.onKeyUp = function(event) {
        save();
    }
    MDEditor.textarea.onKeyDown = function(event) {
        if (event.shiftKey && event.keyCode == 13) {
            var newCaretPosition;
            newCaretPosition = textarea.getCaretPosition() + 1;
            textarea.value = textarea.value.substring(0, textarea.getCaretPosition()) + "\n" + textarea.value.substring(textarea.getCaretPosition(), textarea.value.length);
            textarea.setCaretPosition(newCaretPosition);
        } else if (event.ctrlKey && event.keyCode == 13) {
            var newCaretPosition;
            newCaretPosition = textarea.getCaretPosition() + 2;
            textarea.value = textarea.value.substring(0, textarea.getCaretPosition()) + "  " + textarea.value.substring(textarea.getCaretPosition(), textarea.value.length);
            textarea.setCaretPosition(newCaretPosition);
        }
    }

    function save() {
        sessionStorage.setItem("text", textarea.value);
        sessionStorage.setItem("caret", textarea.getCaretPosition());
        sessionStorage.setItem("title", document.title);
    }
    MDEditor.run();

    document.onkeydown = function(event) {
        window.pressedKey = event.keyCode;
    }
    document.onkeyup = function(event) {
        window.pressedKey = -1;
    }

    window.scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    window.onresize = function() {
        resizePanels();
    }
    if (localStorage.getItem("zen") == 1) {
        document.documentElement.style.overflow = 'hidden';
    }
    resizePanels();

    function getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
            vars[key] = value;
        });
        return vars;
    }
    var hash = getUrlVars();
    if (hash["open"] != null) {
        document.title = decodeURIComponent(localStorage.getItem("lastTitle"));
        textarea.value = localStorage.getItem("lastText");
        MDEditor.updatePreview();
    } else {
        if (sessionStorage["title"] != undefined) {
            textarea.value = sessionStorage.getItem("text");
            textarea.setCaretPosition(sessionStorage.getItem("caret"));
            document.title = sessionStorage.getItem("title");
            MDEditor.updatePreview();
        } else {
            askDocumentName();
        }
        showToast("☻", 1000);
    }

    function askDocumentName() {
        var userInput = prompt("Name this Document", document.title);
        if (userInput == null) {
            userInput == "Untitled";
        }
        document.title = userInput + localStorage.getItem("markdownExtension");
    }

    function resizePanels(zen) {
        if (zen == undefined) {
            zen = localStorage.getItem("zen");
        }
        if (zen == 1) {

            editorPanel.style.width = document.documentElement.clientWidth + "px";
            preview.innerHTML = "";
            smartScroller.innerHTML = "";
            MDEditor.isLivePreview = 0;
            var textareaWidth = localStorage.getItem("zenWidth");
            textarea.style.width = document.documentElement.clientWidth / 100 * textareaWidth + "px";
            textarea.style.marginLeft = document.documentElement.clientWidth / 100 * (100 - textareaWidth) / 2 + "px";
            textarea.style.fontSize = "16px";
            textarea.style.color = "#666";
            textarea.style.height = document.documentElement.clientHeight - 10 + "px";
            textarea.style.marginTop = document.documentElement.clientHeight / 100 * 7 + "px";
            textarea.style.height = document.documentElement.clientHeight - 10 - (document.documentElement.clientHeight / 100 * 14) + "px";

        } else {


            if (textarea.style.marginTop != "4px") {
                textarea.style.marginTop = "4px";
            }
            if (textarea.style.color != "#7E7E7E") {
                textarea.style.color = "#7E7E7E";
            }
            if (textarea.style.marginLeft != "9px") {
                textarea.style.marginLeft = "9px";
            }


            var editorPanelWidth = localStorage.getItem("editorPanelWidth");
            var previewPanelWidth;
            var previewPanelMarginLeft;

            previewPanelWidth = 100 - editorPanelWidth;
            previewPanelMarginLeft = 100 - previewPanelWidth;

            if (editorPanelWidth <= 30) {
                if (document.documentElement.clientWidth > ((50 + 25 + 25 / 4) * window.screen.width / 100)) {
                    previewPanelWidth = 50;
                    previewPanelMarginLeft = 25 + 25 / 4;
                }
                textarea.style.fontSize = "11px";
            } else {
                if (textarea.style.fontSize != "small") {
                    textarea.style.fontSize = "small";
                }
            }

            textarea.style.width = (document.documentElement.clientWidth / 100 * editorPanelWidth) - 9 - 9 / 2 + "px";
            editorPanel.style.width = document.documentElement.clientWidth / 100 * editorPanelWidth + "px";
            previewPanel.style.width = (document.documentElement.clientWidth / 100 * previewPanelWidth) - 15 - 15 / 2 - window.scrollbarWidth + "px";
            previewPanel.style.marginLeft = (document.documentElement.clientWidth / 100 * previewPanelMarginLeft) + 15 + window.scrollbarWidth / 4 + "px";
            adjustEditorPanelHeight();

            MDEditor.isLivePreview = 1;
            MDEditor.updatePreview();

        }

        if (textarea.offsetHeight > editorPanel.offsetHeight) {
            textarea.style.width = textarea.style.width - window.scrollbarWidth;
        }

    }

    function adjustEditorPanelHeight() {
        if (preview.offsetWidth > previewPanel.offsetWidth) {
            textarea.style.height = document.documentElement.clientHeight - window.scrollbarWidth - 10 + "px";
        } else {
            textarea.style.height = document.documentElement.clientHeight - 10 + "px";
        }
    }

    var ctrlKey = (navigator.appVersion.indexOf("Mac") == -1) ? "ctrl" : "command";
    key('ctrl+shift+1', function() {
        if (localStorage.getItem("zen") == 1) {
            document.documentElement.style.overflow = 'auto';
            localStorage.setItem("zen", 0);
        } else {
            if (localStorage.getItem("editorPanelWidth") == 50) {
                localStorage.setItem("editorPanelWidth", 75);
            } else if (localStorage.getItem("editorPanelWidth") == 75) {
                localStorage.setItem("editorPanelWidth", 25);
            } else {
                localStorage.setItem("editorPanelWidth", 50);
            }
        }
        resizePanels();
    });
    key('ctrl+shift+2', function() {
        var onString;
        if (localStorage.getItem("zen") == 0) {
            document.documentElement.style.overflow = 'hidden';
            localStorage.setItem("zen", 1);
            resizePanels(1);
            onString = "ON";
        } else {
            document.documentElement.style.overflow = 'auto';
            localStorage.setItem("zen", 0);
            resizePanels(0);
            onString = "OFF";
        }
        showToast("Zen Mode: " + onString, 1000);
    });
    key('ctrl+shift+3', function() {
        if (localStorage.getItem("zen") == 1) {
            if (localStorage.getItem("zenWidth") == 60) {
                localStorage.setItem("zenWidth", 80);
            } else if (localStorage.getItem("zenWidth") == 80) {
                localStorage.setItem("zenWidth", 40);
            } else {
                localStorage.setItem("zenWidth", 60);
            }
            resizePanels();
        }
    });
    key('ctrl+shift+s', function() {
        if (textarea.value.length > 0) {
            saveAsMd();
        } else {
            var shouldSaveAsMd = confirm("Do you want so save a blank Markdown file ?");
            if (shouldSaveAsMd) {
                saveAsMd();
            }
        }

        function saveAsMd() {
            var bb = new WebKitBlobBuilder();
            bb.append(textarea.value);
            saveAs(bb.getBlob("text/markdown;charset=utf-8"), document.title);
        }

    });
    key('ctrl+shift+p', function() {
        if (textarea.value.length > 0) {
            localStorage["lastHTML"] = MDEditor.getHTML();
            window.open("../pages/print.html");
        } else {
            alert("You don't have any Markdown, please write a little bit.");
        }
    });
    key('ctrl+alt+s', function() {
        if (textarea.value.length > 0) {
            var bb = new WebKitBlobBuilder();
            bb.append(style_html(localStorage.getItem("htmlTemplate").replace("{TITLE}", document.title).replace("{HTML_OUTPUT}", preview.innerHTML)));
            saveAs(bb.getBlob("text/html;charset=utf-8"), document.title.substring(0, document.title.lastIndexOf(".")) + ".html");
        } else {
            alert("You don't have any Markdown, please write a little bit.");
        }
    });
    key(ctrlKey + "+alt+c", function() {
        MDEditor.updatePreview();
        chrome.extension.sendRequest(["copyString", style_html(preview.innerHTML)]);
        showToast("HTML Copied", 1000);
        if (MDEditor.isLivePreview == 0) {
            preview.innerHTML = "";
            smartScroller.innerHTML = "";
        }
    });
    key(ctrlKey + "+alt+v", function() {
        MDEditor.updatePreview();
        chrome.extension.sendRequest(["copyRTF", preview.innerHTML]);
        showToast("RTF Copied", 1000);
        if (MDEditor.isLivePreview == 0) {
            preview.innerHTML = "";
            smartScroller.innerHTML = "";
        }
    });
    key('⌘+b, ctrl+b', function() {
        MDEditor.wrapTextWithString("**");
    });
    key('ctrl+y', function() {
        MDEditor.wrapTextWithString("~");
    });
    key('ctrl+i', function() {
        MDEditor.wrapTextWithString("*");
    });
    key('ctrl+l', function() {
        MDEditor.addLink();
    });
    key('ctrl+k', function() {
        MDEditor.addImage();
    });
    Math.solve = function(string) {

        // NOTE TO GOOGLE: PLEASE ALLOW DEVELOPERs USE EVAL() OR INLINE SCRIPT IN CHROME EXTENSIONS... PLEASE!
        // NOTE TO GOOGLE: PLEASE ALLOW DEVELOPERs USE EVAL() OR INLINE SCRIPT IN CHROME EXTENSIONS... PLEASE!
        // NOTE TO GOOGLE: PLEASE ALLOW DEVELOPERs USE EVAL() OR INLINE SCRIPT IN CHROME EXTENSIONS... PLEASE!

        var initString = string;
        string = string.replace(/(\;)/g, "").replace(/(x)/g, "*");

        try {

            var result = eval(string);
            if (result == undefined) {
                return logError(e);
            } else if (isNaN(result)) {
                return logError(e);
            } else {
                return result.toString().replace(/(\.)/g, ",");
            }

        } catch (e) {
            return logError(e);
        }

        function logError(error) {
			return initString;
        }
    }
    key('ctrl+shift+m', function() {
        var equation = textarea.value.substring(textarea.value.substring(0, textarea.getCaretPosition()).lastIndexOf("{") + 1, textarea.getCaretPosition());
        var result = Math.solve(equation);
        var newCaretPosition = textarea.value.substring(0, textarea.getCaretPosition()).lastIndexOf("{") + result.length;
        textarea.value = textarea.value.substring(0, textarea.value.substring(0, textarea.getCaretPosition()).lastIndexOf("{")) + result + textarea.value.substring(textarea.getCaretPosition(), textarea.value.length);
        textarea.setCaretPosition(newCaretPosition);
    });
    key('ctrl+shift+9', function() {
        textarea.setCaretPosition(0);
        document.body.scrollTop = 0;
        textarea.scrollTop = 0;
    });
    key('ctrl+shift+z', function() {
        MDEditor.updatePreview();
        var words = preview.outerText.split(/[\s\.\?]+/).length - 1;
        if (preview.outerText.length !== 0) {
            showToast(words + " W", 1500);
        } else {
            showToast("No Words", 1500);
        }
        if (MDEditor.isLivePreview = 0) {
            preview.innerHTML = "";
            smartScroller.innerHTML = "";
        }
    });
    key('ctrl+alt+z', function() {
        MDEditor.updatePreview();
        var characters = preview.outerText.length;
        if (preview.outerText.length !== 0) {
            showToast(characters + " C", 1500);
        } else {
            showToast("No Characters", 1500);
        }
        if (MDEditor.isLivePreview = 0) {
            preview.innerHTML = "";
            smartScroller.innerHTML = "";
        }
    });
    key('ctrl+shift+x', function() {
        var today = new Date();
        time = new Array();
        time[0] = today.getHours();
        if (today.getMinutes() < 10) {
            time[1] = "0" + today.getMinutes();
        } else {
            time[1] = today.getMinutes();
        }
        showToast(time[0] + ":" + time[1], 1500);
    });
    var openTime = new Date().getTime();
    key('ctrl+alt+x', function() {
        var timeSpend = Math.floor((new Date().getTime() - openTime) / 60000);
        if (timeSpend > 1) {
            showToast(timeSpend + " minutes", 1500);
        } else {
            showToast("Less than 1 minute", 1500);
        }
    });
    String.prototype.toCapitalize = function() {
        return this.toLowerCase().replace(/(^|\s)([a-z])/g, function(m, p1, p2) {
            return p1 + p2.toUpperCase();
        });
    };
    key('shift+backspace', function() {
        if (textarea.isOnFocus) {
            var newCaretPosition = textarea.getCaretPosition() - 1;
            textarea.value = textarea.value.substring(0, textarea.getCaretPosition() - 1) + textarea.value.substring(textarea.getCaretPosition(), textarea.value.length);
            textarea.setCaretPosition(newCaretPosition);
        } else {
            textarea.focus();
        }
    });
    key('ctrl+shift+y', function() {

        localStorage.setItem("lastText", textarea.value);
        localStorage.setItem("lastTitle", document.title);


        window.open('', '_self', '');
        window.close();
        chrome.windows.create({
            "url": "../Pages/editor.html?open=1",
            "type": "popup",
            "width": window.screen.width / 2,
            "height": window.screen.height / 2
        });
    });
    key('ctrl+,', function() {
        var newCaretPosition = textarea.getCaretPosition() + 2;
        textarea.value = textarea.value.substring(0, textarea.getCaretPosition()) + ", " + textarea.value.substring(textarea.getCaretPosition(), textarea.value.length);
        textarea.setCaretPosition(newCaretPosition);
    });
    key('ctrl+.', function() {
        var newCaretPosition = textarea.getCaretPosition() + 2;
        textarea.value = textarea.value.substring(0, textarea.getCaretPosition()) + ". " + textarea.value.substring(textarea.getCaretPosition(), textarea.value.length);
        textarea.setCaretPosition(newCaretPosition);
    });
    key(ctrlKey + '+shift+backspace', function() {
        if (textarea.isOnFocus) {
            if (textarea.value.length > 0) {
                if (confirm("Are you shure you want to clear your document ?")) {
                    textarea.value = "";
                }
            }
        } else {
            textarea.focus();
        }
    });
    key('ctrl+;', function() {
        if (textarea.isOnFocus) {
            var newCaretPosition = textarea.getCaretPosition() + "...".length;
            textarea.value = textarea.value.substring(0, textarea.getCaretPosition()) + "..." + textarea.value.substring(textarea.getCaretPosition(), textarea.value.length);
            textarea.setCaretPosition(newCaretPosition);
        } else {
            textarea.focus();
        }
    });
    key('ctrl+shift+i', function() {
        if (textarea.isOnFocus) {
            if (textarea.hasSelection()) {
                var newSelection = [];
                newSelection[0] = textarea.selectionStart;
                newSelection[1] = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, textarea.selectionStart) + textarea.getSelectedText().toLowerCase() + textarea.value.substring(textarea.selectionEnd, textarea.value.length);
                textarea.setSelection(newSelection[0], newSelection[1]);
                MDEditor.updatePreview();
            }
        } else {
            textarea.focus();
        }
    });
    key('ctrl+shift+u', function() {
        if (textarea.isOnFocus) {
            if (textarea.hasSelection()) {
                var newSelection = [];
                newSelection[0] = textarea.selectionStart;
                newSelection[1] = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, textarea.selectionStart) + textarea.getSelectedText().toUpperCase() + textarea.value.substring(textarea.selectionEnd, textarea.value.length);
                textarea.setSelection(newSelection[0], newSelection[1]);
                MDEditor.updatePreview();
            }
        } else {
            textarea.focus();
        }
    });
    key('ctrl+shift+o', function() {
        if (textarea.isOnFocus) {
            if (textarea.hasSelection()) {
                var newSelection = [];
                newSelection[0] = textarea.selectionStart;
                newSelection[1] = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, textarea.selectionStart) + textarea.getSelectedText().toCapitalize() + textarea.value.substring(textarea.selectionEnd, textarea.value.length);
                textarea.setSelection(newSelection[0], newSelection[1]);
                MDEditor.updatePreview();
            }
        } else {
            textarea.focus();
        }
    });
    key('ctrl+j', function() {
        askDocumentName();
    });


    document.getElementById("help").onclick = function() {
        window.open("../pages/help.html");
    }


    function showToast(message, timer) {
        if (document.getElementById("toast") != null) {
            try {
                document.body.removeChild(document.getElementById("toast"));
            } catch (e) {}
        }
        var toast = document.createElement('div');
        toast.setAttribute('id', "toast");
        document.body.appendChild(toast);
        toast.innerHTML = "<h1>" + message + "</h1>";
        toast.style['-webkit-transition-duration'] = timer / 1000 + "s";
        setTimeout(function() {
            toast.style.opacity = 0;
            setTimeout(function() {
                try {
                    document.body.removeChild(toast);
                } catch (e) {}
            }, timer / 2);
        }, timer / 2);
    }

    textarea.focus();
}