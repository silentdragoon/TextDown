//check if there are some localstore item that is undefined and set a value to it
if (localStorage.getItem("editorPanelWidth") == undefined) { 
    localStorage.setItem("editorPanelWidth", 50);
}
if (localStorage.getItem("zen") == undefined) { 
    localStorage.setItem("zen", 0);
}
if (localStorage.getItem("zenWidth") == undefined) {
	localStorage.setItem("zenWidth", 70);
}
if (localStorage.getItem("htmlTemplate") == undefined) {
    localStorage.setItem("htmlTemplate", "<!doctype html>\n<head>\n\t<meta charset='utf - 8'>\n\t<title>{TITLE}</title>\n</head>\n<body>\n\t{HTML_OUTPUT}\n</body>\n</html>");
}
if (localStorage.getItem("markdownExtension") == undefined) {
	localStorage.setItem("markdownExtension", ".md");
}