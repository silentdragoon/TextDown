chrome.extension.onRequest.addListener( function (message) {
    if (message[0] == "setLocalStorage") {
        localStorage[message[1]] = message[2];
    } else if (message[0] == "copyString") {
        copyString(message[1]);
    } else if (message[0] == "copyRTF") {
        copyRTF(message[1]);
    }
});

function copyString(string) {
    document.getElementById("pageContent").innerHTML = "<textarea id='textarea'></textarea>";
    document.getElementById("textarea").value = string;
    document.getElementById("textarea").select();
    document.execCommand('Copy');
}

function copyRTF(html) { //copy rft /input needs to be in html
    document.getElementById("pageContent").innerHTML = "<div id='rtf'></div>";
    document.getElementById("rtf").innerHTML = html;
    document.execCommand('selectAll',false,null);
    document.execCommand("Copy");
}

var contexts = ["link", "image"];
chrome.contextMenus.create({
    "title": "Copy Link Adress as Markdown",
    "contexts": [contexts[0]],
    "onclick": function(info) {
        if (info.selectionText != info.linkUrl) {
        copyString("[" + info.selectionText + "](" + info.linkUrl + ")");
    } else {
        copyString("[](" + info.linkUrl + ")");
    }
    }
});
chrome.contextMenus.create({
    "title": "Copy Image Adress as Markdown",
    "contexts": [contexts[1]],
    "onclick": function (info) {
        copyString("![image](" + info.srcUrl + ")");
    }
});
chrome.contextMenus.create({
    "title": "Copy Page Adress as Markdown",
    "onclick": function (tab) {
        copyString("[" + tab.title + "](" + info.pageUrl + ")");
    }
});