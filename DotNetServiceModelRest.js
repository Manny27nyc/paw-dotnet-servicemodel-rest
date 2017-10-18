function pathJoin(parts, sep){
   var separator = sep || '/';
   var replace   = new RegExp(separator+'{1,}', 'g');
   return parts.join(separator).replace(replace, separator);
}

var DotNetServiceModelRest = function() {

    this.import = function(context, items, options) {

        var baseUrl = options.inputs['baseUrl'];
        if(baseUrl.substr(baseUrl.length-1, 1)=="/") { baseUrl = baseUrl.substr(0, baseUrl.length-1);  }

        console.log(baseUrl.substr(baseUrl.length-1, 1));
        console.log(baseUrl);

        var i = 1;
        for (var i in items) {
            var item = items[i];

            regex = /\[WebGet\(UriTemplate ?= ?"([^"]+)"\)\][\s\S]+?([a-zA-Z]+)\(.+/g;
            while(match = regex.exec(item.content)) {
                var url = match[1];
                if(url.substr(0, 1) != "/") { url = "/" + url; } 
                description = match[0].replace(/^[\t ]+/gm, "\n");
                var request = context.createRequest(match[2], "GET", baseUrl + url, description);
            }


            regex = /\[WebInvoke\(.*?UriTemplate ?= ?"([^"]+)".*?\)\][\s\S]+?([a-zA-Z]+)\(.+/g;
            while(match = regex.exec(item.content)) {
                
                var method = match[0].replace(/^[\s\S]+Method ?= ?"([^"]+)"[\s\S]+$/g, "$1");
                var url = match[1];
                if(url.substr(0, 1) != "/") { url = "/" + url; } 
                description = match[0].replace(/^[\t ]+/gm, "\n");
                var request = context.createRequest(match[2], method, baseUrl + url, description);
            }

            i++;
        }
        return true;


    }
    // check if we can import these items
    this.canImport = function(context, items) {
        var knownItems = 0;
        for (var i in items) {
            var item = items[i];
            var itemString = item.content;

            regex = /\[(WebGet|WebInvoke)/g;
            while(match = regex.exec(item.content)) {
                knownItems++;
                break;
            }

        }
        var confidence = knownItems/(items.length);
        console.log("Confidence: " + confidence);
        return confidence;// or, true
    }
}
DotNetServiceModelRest.identifier = "se.jensolsson.DotNetServiceModelRest";
DotNetServiceModelRest.title = ".NET Service Model REST";
DotNetServiceModelRest.fileExtensions = ["cs"];
DotNetServiceModelRest.inputs = [
    InputField("baseUrl", "Base URL", "String", {persisted: true, defaultValue: "http://", placeholder: "Enter a base URL for all the methods"}),
];
registerImporter(DotNetServiceModelRest);
