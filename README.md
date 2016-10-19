##About

"autoSelector" is a small JS script that returns a map of auto-selected dom nodes. It also auto-attaches a jQuery wrapper.

##Example

```html
<div id="my-el">
    <a href="#" js="myLink">My link</a>
    <button js="myBtn">My button</button>
</div>
```

```javascript
var myEl = autoSelector.parse( document.getElementById('my-el') );

myEl.myLink.onclick = function(){};
myEl.$myBtn.click(function(){});

```

##Custom Configuration

The default configuration looks for the "js" attribute in nodes. This behaviour can be changed in different ways:

```javascript
autoSelector.setDefaultConf({
    'selector': '.js', // The default selector is '[js]'
    'prefix': '{{scope-id}}__', // This string will be removed from the nodes' names in the map
    'parsed-attribute': 'class', // Attribute used to extract the nodes' names
    'attach-jquery': false // Default is true
});
```

The above configuration could work well with BEMmed html:

```html
<div id="my-el">
    <a href="#" class="my-el__myLink js">My link</a>
    <button class="my-el__my-btn js">My button</button>
</div>
```

```javascript
var myEl = autoSelector.parse( document.getElementById('my-el') );

myEl.myLink.onclick = function(){};
myEl['my-btn'].click(function(){});
```

Note: there are few **"Wildcard strings"** that can be used:
- ```{{scope-id}}```, ```{{scope-class}}```, ```{{scope-customTagName}}```: these will be replaced by the attributes of the "scope". The "scope" is the node (or nodes) passed to the "parse" function.
- The above wildcard strings can be combined with "/"; for example: ```{{scope-id/class}}``` or ```{{scope-customTagName/id}}```
- The ```'parsed-attribute'``` option can accept any dom attribute (such as "id" or "class" or "data-anything"). It can also accept "id/class", this will parse both the id and class of each selected node.

##Live examples:

[Simple form](https://rawgit.com/francescozaniol/autoSelector/master/examples/simple-form.html)

[Simple BEMmed form](https://rawgit.com/francescozaniol/autoSelector/master/examples/simple-form-bem.html)

[Custom tag + BEM](https://rawgit.com/francescozaniol/autoSelector/master/examples/custom-tag-bem.html)

##Further notes

- To improve performance, the jQuery wrapper is generated when the mapped object is used for the first time:

```javascript
// Here "myEl.$myBtn" hasn't been used and hasn't been created
// ... code ...
myEl.$myBtn.click(function(){}); // First time use for "myEl.$myBtn", the jQuery wrapper is created on the spot
// ... code ...
```

- A temporary configuration can be used if passed to the main function:

```javascript
var myEl = autoSelector({ // temporary config, only for one parse
        'parsed-attribute': 'class'
    })
    .parse( document.getElementById('my-el') );
// From now on the parse configuration is reverted to the default one
```

- A string (CSS selector) can be used as a scope instead of a node:

```javascript
var myEl = autoSelector.parse( '#my-el' );
```