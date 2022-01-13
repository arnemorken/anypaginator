# anyPaginator
An easy to use, yet advanced and fully customizable javascript/jQuery paginator plugin. 

<img src="examples/anyPaginator1.png"><br/>
<img src="examples/anyPaginator2.png"><br/>
<img src="examples/anyPaginator3.png"><br/>

Take a look at the jsFiddle demos:

* "Hello world":     https://jsfiddle.net/arnemorken/2qf7k4cs/55/
* Local table data:  https://jsfiddle.net/arnemorken/0snofdq7/33/
* Remote table data: https://jsfiddle.net/arnemorken/kou1r0e6/21/
* Image pagination:  https://jsfiddle.net/arnemorken/fm2hpgc0/1/

# Download

- Github repository:                  https://github.com/arnemorken/anypaginator/
- Balanse Software (minified):        https://balanse.info/cdn/anypaginator/anyPaginator.min.zip (coming soon)
- Balanse Software (source/examples): https://balanse.info/cdn/anypaginator/anyPaginator.zip (coming soon)

# Usage

1. Include the anyPaginator Javascript and CSS files:

```html
<script src="/path/to/anyPaginator.js"></script>
<link  href="/path/to/anyPaginator.css" rel="stylesheet"/>
```

2. Provide a place for the paginator and its' associated data to live:
```html
<div id="mypager"></div>
<div id="mydata"></div>
```

3. Initialize the paginator and add some pages:
```js
let pager =  $("#mypager").anyPaginator({ onClick: function() { refreshData(pager); } });
for (let i=1; i<=200; i++) {
  // Add a page number each itemsPerPage rows
  if (!((i-1) % pager.options.itemsPerPage))
    pager.anyPaginator("add");
}
```

4. Display some data initially:
```js
refreshData(pager);
```

5. Have the onClick calback function redraw the contents according to the page number selected:
```js
function refreshData(pager)
{
  $("#mydata").empty();
  let start = (pager.currentPage - 1) * pager.options.itemsPerPage + 1;
  let stop  = start + pager.options.itemsPerPage - 1;
  for (let i=start; i<=stop; i++)
    $("#mydata").append("<p>Hello row "+i+"</p>");
}
```

# Improvements

Got an idea for improving anyPaginator? A cool new feature you'd like to see? Think you've found a bug? Contact us at software@balanse.info!

PS! We love pull requests! ;)

# API

### Options

| Option                       | Description                                                    | Type                         | Default                    |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------- | -------------------------- |
| mode                         | 0: buttons, 1: page number, 2: item range. If using mode 2, the paginator should be called with "item", or setNumItems should be called after all pages are added.| Number                       | 0                          |
| itemsPerPage                 | Number of items per page                                       | Number                       | 20                         |
| splitLeft                    | Number of split buttons to the left                            | Number                       | 3                          |
| splitMiddle                  | Number of split buttons in the middle                          | Number                       | 3                          |
| splitRight                   | Number of split buttons to the right                           | Number                       | 3                          |
| itemText                     | Text in front of item range for mode == 1                      | String                       | "Item"                     |
| pageText                     | Text in front of page number for mode == 2                     | String                       | "Page"                     |
| gotoText                     | Text on the "goto" button, ignored if gotoIcon is set          | String                       | "Go"                       |
| prevText                     | Text on the "previous" button, ignored if prevIcon is set      | String                       | "&lsaquo;"                 |
| nextText                     | Text on the "next" button, ignored if nextIcon is set          | String                       | "&rsaquo;"                 |
| firstText                    | Text on the "first" button, ignored if firstIcon is set        | String                       | "&laquo;"                  |
| lastText                     | Text on the "last" button, ignored if lastIcon is set          | String                       | "&raquo;"                  |
| gotoIcon                     | Font Awesome icon on the "goto" button instead of gotoText     | String                       | null                       |
| prevIcon                     | Font Awesome icon on the "previous" button instead of prevText | String                       | null                       |
| nextIcon                     | Font Awesome icon on the "next" button instead of nextText     | String                       | null                       |
| firstIcon                    | Font Awesome icon on the "first" button instead of firstText   | String                       | null                       |
| lastIcon                     | Font Awesome icon on the "last" button instead of lastText     | String                       | null                       |
| hideGoto                     | Whether to hide the "goto" button/input field                  | Bool                         | false                      |
| hidePrev                     | Whether to hide the "previous" button                          | Bool                         | false                      |
| hideNext                     | Whether to hide the "next" button                              | Bool                         | false                      |
| hideFirst                    | Whether to hide the "first" button                             | Bool                         | true                       |
| hideLast                     | Whether to hide the "last" button                              | Bool                         | true                       |
| onClick                      | User defined event handler for button click                    | Function                     | undefined                  |

### Public methods

#### Constructor
Initialize options and properties and redraw the paginator.
```js
// Initialize the plugin with default values
var pager = $("#mydiv").anyPaginator();

// Initialize the plugin with 10 items per page, 2 buttons on the left and right side and a Font Awesome icon for the ellipsis:
var pager = $("#mydiv").anyPaginator({ 
                          itemsPerPage: 10,
                          splitLeft:    2,
                          splitRight:   2,
                          ellipsisIcon: "fa-thin fa-ellipsis-stroke",
                        });
```

#### reset(options)
Reset options and properties and redraw the paginator.
```js
// Reset the plugin to mode 1
pager = pager.reset({mode:1});
```

#### getCurrentPage()
Return the page that is currently highlighted.
```js
var cp = pager.anyPaginator("currentPage");

var cp = pager.getCurrentPage();
```

#### getNumItems()
Return the number of items in the paginator.
```js
var np = pager.anyPaginator("numItems");

var np = pager.getNumItems();
```

#### getNumPages()
Return the number of pages in the paginator.
```js
var np = pager.anyPaginator("numPages");

var np = pager.getNumPages();
```


#### setCurrentPage()
Set the current page and redraw the paginator.
```js
pager.anyPaginator("setCurrentPage",17);

pager.setCurrentPage(17);
```

#### setNumPages()
Sets the number of pages and redraw the paginator.
```js
pager.anyPaginator("setNumPages",15);

pager.setNumPages(15);
```

#### setNumItems()
Set the number of items and redraw the paginator. The number of pages will be recalculated.
```js
pager.anyPaginator("setNumItems",200);

pager.setNumItems(200);
```

#### setOption(options)
Set one or more options for the paginator.
```js
pager.anyPaginator("option",{splitFirst:2,splitLast:2});

pager.setOption({splitFirst:2,splitLast:2});
```

#### refresh()
Redraw all the page numbers, ellipsis and navigators. If a user-supplied onClick handler is set in options, it will be called with the specified arguments in an array after refresh has completed.
```js
pager.anyPaginator("refresh",pager,num);

pager.refresh(pager,num);
```

#### addPage()
Add a page number button.
```js
pager.anyPaginator("add");

pager.addPage();
```

#### removePage()
Remove a page number button.
```js
pager.anyPaginator("remove");

pager.removePage();
```

#### showPage(pageNo)
Redraw the paginator with focus on the page pageNo.
```js
pager.anyPaginator("show",12);

pager.showPage(12);
```

#### buttonClicked(event)
Update the paginator when a button is clicked. 
Normally not neccessary to call this method. 
If a user defined onClick method is set in options, it will be called after buttonClicked has finished.

#### gotoClicked(event)
Update the paginator when the go button is clicked or enter is pressed in the input field.
Normally not neccessary to call this method.
If a user defined onClick method is set in options, it will be called after gotoClicked has finished.

# License

AGPLv3.0 for open source use or anyPaginator Commercial License for commercial use.

Get licences here: http://balanse.info/anypaginator/license/ (coming soon).

# Contact

Feature requests, ideas, bug reports: software@balanse.info

License and other commercial inqueries: license@balanse.info

------------------------------------------------------------------------

### See also the anyList project: https://github.com/arnemorken/anylist
