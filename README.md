## About

"autoSelector" is a small library (~1KB gzipped) that returns a collection of auto-selected dom nodes. It also auto-attaches the jQuery wrapper (optional and customizable).

## Example

```html
<div id="my-el">
    <a href="#" js="myLink">My link</a>
    <button js="myBtn">My button</button>
</div>
```

```javascript
var myEl = autoSelector.parse( '#my-el' );

myEl.myLink.onclick = function(){}; // vanilla node
myEl.$myBtn.click(function(){}); // add "$" to generate the jQuery wrapper

```

## Custom Configuration

The default configuration looks for the "js" attribute in nodes. This behaviour can be changed in different ways:

```javascript
autoSelector.setDefaultConf({
    'selector': '.js', // The default selector is '[js]'
    'prefix': '{{scope-id}}__', // This string will be removed from the nodes' names in the collection
    'parsed-attribute': 'class', // Attribute used to extract the nodes' names
    'wrapper': window.cash // Default is window.jQuery
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
myEl['$my-btn'].click(function(){});
```

Note: there are few **"Wildcard strings"** that can be used:
- ```{{scope-id}}```, ```{{scope-class}}```, ```{{scope-tagName}}```: these will be replaced by the attributes of the "scope". The "scope" is the node (or nodes) passed to the "parse" function.
- The above wildcard strings can be combined with "/"; for example: ```{{scope-id/class}}``` or ```{{scope-tagName/id}}```
- The ```'parsed-attribute'``` option can accept any dom attribute (such as ```'id'``` or ```'class'``` or ```'data-anything'```). It can also accept ```'id/class'```, this will parse both the id and class of each selected node.

## Live examples:

[Simple form](https://rawgit.com/francescozaniol/autoSelector/master/examples/simple-form.html)

[Simple BEMmed form](https://rawgit.com/francescozaniol/autoSelector/master/examples/simple-form-bem.html)

[Custom tag + BEM](https://rawgit.com/francescozaniol/autoSelector/master/examples/custom-tag-bem.html)

## Further notes

- To improve performance, the wrapper (jQuery by default) is generated when it is used for the first time.

```javascript
// Here "myEl.$myBtn" hasn't been used and hasn't been initialized
// ... code ...
myEl.$myBtn.click(function(){}); // First time use for "myEl.$myBtn", the wrapper is created on the spot
```

- A temporary configuration can be used if passed to the main function:

```javascript
var myEl = autoSelector({ // temporary config, only for one parse
        'parsed-attribute': 'class'
    })
    .parse( document.getElementById('my-el') );
// From now on the parse configuration is reverted to the default one
```
- A string (CSS selector) or a node/collection can be used as the scope:

```javascript
var myEl = autoSelector.parse( '#my-el' ); // Equal to:
var myEl = autoSelector.parse( document.getElementById('my-el') );
```
- If multiple nodes are selected, an array of nodes is returned. This array can be easily lopped through using the "forEach" function:

```html
<div id="my-el">
    <button js="btn">btn 1</button>
    <button js="btn">btn 2</button>
    <button js="btn">btn 3</button>
</div>
```
```javascript
var buttons = autoSelector.parse( '#my-el' );
buttons.btn.forEach(function(el){
    el.classList.add('btn');
});
```
