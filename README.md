# anyPaginator [![CodeQL](https://github.com/arnemorken/anypaginator/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/arnemorken/anypaginator/actions/workflows/codeql-analysis.yml) <img src="balanselogo_85x95.png" align="right">
An easy to use, yet advanced and fully customizable Javascript/jQuery paginator plugin.
anyPaginator is a spinoff of the <a href="https://github.com/arnemorken/anylist">anyList</a> project
and we think it's the best Javascript paginator out there. 

<img src="examples/anyPaginator1.png"><br/>
<img src="examples/anyPaginator2.png"><br/>
<img src="examples/anyPaginator3.png"><br/>

Take a look at the jsFiddle demos:

* "Hello world":     https://jsfiddle.net/arnemorken/2qf7k4cs/57/
* Local table data:  https://jsfiddle.net/arnemorken/0snofdq7/35/
* Remote table data: https://jsfiddle.net/arnemorken/kou1r0e6/24/
* Image pagination:  https://jsfiddle.net/arnemorken/fm2hpgc0/3/

Both pages and items can be added to the paginator. In the latter case, page buttons will be added automatically as needed. 
The recommended method is to simply set the "numItems" option. Pages and/or items may be added dynamically at any time.

The user provides a callback function to redraw data whenever a button is pressed, anyPaginator takes care of the rest.

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
let pager = $("#mypager").anyPaginator({ onClick: function() { refreshData(pager); } });
pager.numItems(200);
```

4. Display some data initially:
```js
refreshData(pager);
```

5. Have the onClick calback function redraw the data according to the page number selected:
```js
function refreshData(pager)
{
  $("#mydata").empty();
  let start = (pager.currentPage() - 1) * pager.options.itemsPerPage + 1;
  let stop  = start + pager.options.itemsPerPage - 1;
  for (let i=start; i<=stop; i++)
    $("#mydata").append("<p>Hello row "+i+"</p>");
}
```

# API

### Options

| Option                       | Description                                                    | Type                         | Default                    |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------- | -------------------------- |
| mode                         | 0: buttons, 1: page number, 2: item range.                     | Number                       | 0                          |
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

#### currentPage()
Get the page that is currently highlighted or set highlight to a given page.
```js
// Get
var curr_page = pager.anyPaginator("currentPage");
var curr_page = pager.currentPage();
// Set
pager.anyPaginator("currentPage",17);
pager.currentPage(17);
```

#### numPages()
Get or set the number of pages in the paginator.
```js
// Get
var n_pages = pager.anyPaginator("numPages");
var n_pages = pager.numPages();
// Set
pager.anyPaginator("numPages",15);
pager.numPages(15);
```

#### numItems()
Get or set the number of items in the paginator.
```js
// Get
var n_pages = pager.anyPaginator("numItems");
var n_pages = pager.numItems();
// Set
pager.anyPaginator("numItems",200);
pager.numItems(200);
```

#### option() 
#### option(option) 
#### option(options) 
#### option(option,val)
Get or set one or more options for the paginator.
```js
// Get
pager.anyPaginator("option"); // Get the options object
pager.option();               // Get the options object
pager.anyPaginator("option","pageText"); // Get the "pageText" option
pager.option("pageText");                // Get the "pageText" option
// Set
pager.anyPaginator("option",{splitLeft:2,splitRight:2}); // Set all options in the given object
pager.option({splitLeft:2,splitRight:2});                // Set all options in the given object
pager.anyPaginator("option","splitLeft",2);              // Set the "splitLeft" option
pager.option("splitLeft",2);                             // Set the "splitLeft" option
```

#### refresh()
Redraw all the page numbers, ellipsis and navigators. If a user-supplied onClick handler is set in options, it will be called with the specified arguments in an array after refresh has completed.
```js
pager.anyPaginator("refresh",pager,num);
pager.refresh(pager,num);
```

#### addPage()
Increase number of pages by 1 and display a new page number button.
Note that instead of using "addPage" you may add items with "addItem" or simply by setting the "numPages" or "numItems"
option, in which case page numbers will be added automatically as needed. Setting "numItems" is the recommended way.

If pages are added with "addPage" and you need to change "itemsPerPage" at a later time, "numItems(n)" must be called
before setting "itemsPerPage" in order for the correct number of pages to be calculated.
```js
pager.anyPaginator("page");
pager.addPage();
```

#### removePage()
Decrease number of pages by 1 and remove a page number button.
```js
pager.anyPaginator("page","remove");
pager.removePage();
```

#### addItem()
Increase number of items by 1, recalculate number of pages and display a new page number button if neccessary.
Note that instead of using "addItem" you may add pages with "addPage" or simply by setting the "numPages" or "numItems"
option, in which case page numbers will be added automatically as needed. Setting "numItems" is the recommended way.

If items are added with "addItem" you should call either "refresh" or "numItems(n)" or set "itemsPerPage" after all items 
are added in order for the paginator to be displayed with correct values.
```js
pager.anyPaginator("item");
pager.addItem();
```

#### removeItem()
Decrease number of items by 1, recalculate number of pages and remove a page number button if neccessary.
```js
pager.anyPaginator("item","remove");
pager.removeItem();
```

#### showPage(pageNo)
Set focus to the page pageNo.
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

# Improvements

Got an idea for improving anyPaginator? A cool new feature you'd like to see? Think you've found a bug? Contact us at software@balanse.info!
We love pull requests! ;)

# License

AGPLv3.0 for open source use or anyPaginator Commercial License for commercial use.

Get licences here: http://balanse.info/anypaginator/license/ (coming soon).

# Contact

Feature requests, ideas, bug reports: software@balanse.info

License and other commercial inquiries: license@balanse.info

------------------------------------------------------------------------

### See also the anyList project: https://github.com/arnemorken/anylist
