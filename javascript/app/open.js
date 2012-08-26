(function(document) { 

	var text = decodeURIComponent(escape(document.body.innerText));
	var title = window.location.toString().substring(window.location.toString().lastIndexOf("/") + 1, window.location.toString().length);

	if (window.location.toString().substring(0,4) == "file") { //it's from hard drive
		open();
	} else {
		if (confirm("Seems that this is a markdown file. Want to open it with TextDown ?")){
			open();
		}
	}

	function open(newTab) {

		chrome.extension.sendRequest(["setLocalStorage", "lastText", text]);
		chrome.extension.sendRequest(["setLocalStorage", "lastTitle", title]);
		var chromeExtensionId = chrome.i18n.getMessage("@@extension_id");
		window.open("chrome-extension://" + chromeExtensionId + "/Pages/editor.html?open=1");

	}

}(document));