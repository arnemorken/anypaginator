# anyPaginator
An easy to use, yet advanced and fully customizable javascript/jQuery paginator. 

<img src="examples/anyPaginator1.png"><br/>

Take a look at the jsFiddle demos:

* "Hello world":     https://jsfiddle.net/arnemorken/2qf7k4cs/46/
* Local table data:  https://jsfiddle.net/arnemorken/0snofdq7/23/
* Remote table data: https://jsfiddle.net/arnemorken/kou1r0e6/8/

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
  if (!((i-1) % pager.options.itemsPerPage)) {
    pager.anyPaginator("add");
  }
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
  for (let i=start; i<=stop; i++) {
    $("#mydata").append("<p>Local row "+i+"</p>");
  }
}
```

# API

### Options

| Option                       | Description                                                    | Type                         | Default                    |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------- | -------------------------- |
| mode                         | 0: buttons, 1: item range, 2: page number                      | Number                       | 0                          |
| itemsPerPage                 | Number of items per page                                       | Number                       | 20                         |
| splitLeft                    | Number of split buttons to the left                            | Number                       | 3                          |
| splitMiddle                  | Number of split buttons in the middle                          | Number                       | 3                          |
| splitRight                   | Number of split buttons to the right                           | Number                       | 3                          |
| modeItemText                 | Text in front of item range for mode == 1                      | String                       | "Item"                     |
| modePageText                 | Text in front of page number for mode == 2                     | String                       | "Page"                     |
| gotoText                     | Text on the "go" button                                        | String                       | "Go"                       |
| prevText                     | Text on the "previous" button, ignored if prevIcon is not null | String                       | "&lsaquo;"                 |
| nextText                     | Text on the "next" button, ignored if nextIcon is not null     | String                       | "&rsaquo;"                 |
| firstText                    | Text on the "first" button, ignored if firstIcon is not null   | String                       | "&laquo"                   |
| lastText                     | Text on the "last" button, ignored if lastIcon is not null     | String                       | "&raquo"                   |
| gotoIcon                     | Font Awesome icon on the "go" button instead of gotoText       | String                       | null                       |
| prevIcon                     | Font Awesome icon on the "previous" button instead of prevText | String                       | null                       |
| nextIcon                     | Font Awesome icon on the "next" button instead of nextText     | String                       | null                       |
| firstIcon                    | Font Awesome icon on the "first" button instead of firstText   | String                       | null                       |
| lastIcon                     | Font Awesome icon on the "last" button instead of lastText     | String                       | null                       |
| hideGoto                     | Whether to hide the "goto page" button/input field             | Bool                         | false                      |
| hidePrev                     | Whether to hide the "previous" button                          | Bool                         | false                      |
| hideNext                     | Whether to hide the "next" button                              | Bool                         | false                      |
| hideFirst                    | Whether to hide the "first" button                             | Bool                         | true                       |
| hideLast                     | Whether to hide the "last" button                              | Bool                         | true                       |

### Public methods

#### initialize(opt)
Initialize options and properties.
Examples: 
```js
let pager = $("#myfoot").anyPaginator({mode:1});
```
```js
pager.initialize({mode:1});
```

#### setOptions(opt,args)
Set options for the paginator.
Examples: 
```js
$("#myfoot").anyPaginator("options",{splitFirst:2});
```
```js
pager.setOptions({splitFirst:2});
```

#### getNumPages()
Return the number of pages in the paginator.
Examples: 
```js
$("#myfoot").anyPaginator("numPages");
```
```js
pager.getNumPages();
```

#### getCurrentPage()
Return the page that is currently highlighted.
Examples: 
```js
$("#myfoot").anyPaginator("currentPage");
```
```js
pager.getCurrentPage();
```

#### reset()
Remove all pages, reset the current page and the number of pages and create go/prev/next/first/last buttons
Examples: 

#### refresh(opt)
Redraw all the page numbers, ellipsis and navigators
Examples: 

#### addPage()
Add a page number button
Examples: 

#### removePage()
Remove a page number button
Examples: 

#### showPage(pageNo)
Redraw the paginator with focus on the page pageNo
Examples: 

#### buttonClicked(event)
Update the paginator when a button is clicked
Examples: 

#### goClicked(event)
Update the paginator when the go button is clicked or enter is prerss in the input field
Examples: 

# License

AGPLv3.0 for open source use or anyPaginator Commercial License for commercial use.

Get licences here: http://balanse.info/anypaginator/license/ (coming soon).

### See also the anyList project: https://github.com/arnemorken/anylist
