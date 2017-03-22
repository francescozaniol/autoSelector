// v 0.2.0

(function(){

    //
    // Global vars
    //

    var i, j;

    var parsedAttr, selectedNodes, exsistingNode, conf, escaperRegex, tmpConf = null, _tmpConf;

    var escaperRegexTagName = /{{scope-[a-z/]*[/]?tagName[/]?[a-z/]*}}/;
    var escaperRegexId = /{{scope-[a-z]*[/]?id[/]?[a-z/]*}}/;
    var escaperRegexClassName = /{{scope-[a-z]*[/]?class[/]?[a-z/]*}}/;

    var defaultConf = {
        'selector': '[js]',
        'prefix': '',
        'parsed-attribute': 'js',
        'wrapper': window.jQuery
    };

    //
    // Set permanent configuration
    //

    function setDefaultConf(c){

        if(!c) return;

        for( i in defaultConf){
            if(c[i]) defaultConf[i] = c[i];
        }

    }

    //
    // Set a temporary conf: only for one parse
    //

    window.autoSelector = function(c){

        if(!c) return;

        tmpConf = {};

        for( i in defaultConf){
            if(c[i]) tmpConf[i] = c[i];
            else tmpConf[i] = defaultConf[i];
        }

        return window.autoSelector;

    };

    //
    // Simple parse
    // 
    // @param comp : string or dom
    // @param options : object
    //
    // @return object
    //

    function parse( scope ){

        // --------- Checks and inits --------- //

        if( typeof scope == 'string' ){ // The scope is a string selector
            scope = _find( scope, document );
        }

        if( // check scope validity
            !scope ||
            scope.length === 0 ||
            ( typeof scope.length !== 'number' && !scope.nodeType ) ||
            ( scope.length > 0 && !scope[0].nodeType )
        ){
            return null;
        }

        var collection = { self: scope };

        // --------- Prepare the scope --------- //

        if(!scope.nodeType && scope.length && scope[0].nodeType){ // The scope is a nodeList or dom array
            if(scope.length === 1){ // Only one element, easy
                scope = scope[0];
            } else { // If more nodes, return an array with parsed elements (calling "parse" recursively)

                _tmpConf = tmpConf; // "remember" the temporary config

                for(var k = scope.length - 1; k >= 0; k--){
                    tmpConf = _tmpConf; // make sure the temporary config doesn't get reset
                    collection[k] = parse(scope[k]);
                    for( j in collection[k] ){
                        if(!collection[j]){ collection[j] = []; }
                        collection[j].push(collection[k][j]);
                    }
                }

                tmpConf = null;

                return collection; // Note: return here

            }
        }

        // --------- Conf build --------- //

        conf = tmpConf || defaultConf;

        // If present, replace special strings
        for( i in conf ){
            if( typeof conf[i] == 'string' && conf[i].indexOf('{{') !== -1 ){

                if( escaperRegex = escaperRegexTagName.exec(conf[i]) ){
                    conf[i] = conf[i].replace( escaperRegex[0], scope.nodeName.toLowerCase() );
                    continue;
                }

                if( escaperRegex = escaperRegexId.exec(conf[i]) ){
                    conf[i] = conf[i].replace( escaperRegex[0], scope.id );
                    continue;
                }

                if( escaperRegex = escaperRegexClassName.exec(conf[i]) ){
                    conf[i] = conf[i].replace( escaperRegex[0], scope.nodeName.toLowerCase() );
                    continue;
                }

            }
        }

        // --------- Select all possible doms to add to collection --------- //

        selectedNodes = _find( conf['selector'], scope );

        // --------- Populate collection with elected elements --------- //

        for( k = 0; k < selectedNodes.length; k++ ){

            // --------- Get & prepare the parsed attribute --------- //

            if( conf['parsed-attribute'] === 'id' ) parsedAttr = selectedNodes[k].id;
            else if( conf['parsed-attribute'] === 'class' ) parsedAttr = selectedNodes[k].className;
            else if( conf['parsed-attribute'] === 'id/class' ){
                parsedAttr =
                    selectedNodes[k].id +
                    ((selectedNodes[k].id.length && selectedNodes[k].className.length) ? ' ' : '') +
                    selectedNodes[k].className;
            }
            else parsedAttr = selectedNodes[k].getAttribute( conf['parsed-attribute'] );

            if(parsedAttr.indexOf(' ') > -1){ // multiple selectors? (e.g. selectedNodes="selctorOne selctorTwo")
                parsedAttr = parsedAttr.split(' ');
            } else { // just a single selector (e.g. selectedNodes="singleSelector")
                parsedAttr = [parsedAttr];
            }

            // --------- Parse attribute's content + push detected elements --------- //

            for( y = parsedAttr.length - 1; y >= 0; y-- ){

                // Ignore not-escaped elements
                if( conf['prefix'] && parsedAttr[y].indexOf(conf['prefix']) == -1 ) continue;

                parsedAttr[y] = parsedAttr[y].replace(conf['prefix'], '');

                // Check whether there are another selected elements with the same selector name
                exsistingNode = collection[parsedAttr[y]];

                if(exsistingNode){ // Yes, there are previous elements with the same selector
                    if(!exsistingNode.length){ // is array?
                        collection[parsedAttr[y]] = [exsistingNode]; // no? then make it an array
                    }
                    collection[parsedAttr[y]].push(selectedNodes[k]); // push the new selected element
                } else { // No, the current selector is unique, so just store it
                    collection[parsedAttr[y]] = selectedNodes[k];
                }

            }

        }

        // --------- Attach wrapper? --------- //

        if( conf['wrapper'] ){

            for(i in collection){

                // The wrapper will be created only at the first access to the object:
                if(Object.defineProperty && Object.bind){
                    Object.defineProperty(collection, ('$'+i), {
                        get: _getter.bind({ collection: collection, id: i, wrapper: conf['wrapper'] }), // "_getter" is defined below
                        configurable: true // needed to redefine obj (see "_getter")
                    });
                } else { // IE8 gets the wrapper right away (no caching)
                    collection['$'+i] = conf['wrapper'](collection[i]);
                }

            }

        }

        // --------- Ending --------- //

        tmpConf = null;

        return collection;

    }

    //
    // Helper functions
    //

    var _regexSingleSelector = /^[#\.]?[\\!\w-]+$/;
    function _find(s, rootNode){
        if( _regexSingleSelector.test(s) ){
            if( s[0] == '.' ){
                return rootNode.getElementsByClassName ?
                    rootNode.getElementsByClassName( s.substr(1) ) :
                    rootNode.querySelectorAll( s )
                ;
            } else if( s[0] == '#' ){
                return document.getElementById( s.substr(1) );
            } else {
                return rootNode.getElementsByTagName(s);
            }
        } else {
            return rootNode.querySelectorAll( s );
        }
    }

    function _getter(){
        Object.defineProperty(this.collection, ('$'+this.id), {
            value: this.wrapper(this.collection[this.id])
        });
        return this.collection['$'+this.id];
    }

    //
    // Public
    //

    window.autoSelector.setDefaultConf = setDefaultConf;
    window.autoSelector.parse = parse;

}());
