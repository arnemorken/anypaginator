/* jshint esversion: 9 */
"use strict";
/****************************************************************************************
 *
 * anyPaginator is copyright (C) 2021-2023 Arne D. Morken and Balanse Software.
 *
 * License: AGPLv3.0 for open source use or anyPaginator Commercial License for commercial use.
 * Get licences here: http://anypaginator.balanse.info/
 *
 * See also the anyVista project: https://github.com/arnemorken/anyvista
 *
 ****************************************************************************************/

(function ( $ ) {

$.fn.anyPaginator = function (cmd,...args)
{
  ////////////////////
  // Public methods //
  ////////////////////

  //
  // "Constructor".
  // Initialize / reset options and properties and redraw.
  // Does not call user defined click function.
  //
  this.reset = function(opt)
  {
    this._baseId = "_apid" + 1 + Math.floor(Math.random()*10000000); // Pseudo-unique id
    if (opt && typeof opt == "object") {
      this.setDefaults(opt); // Set user-defined options
    }
    else {
      this.setDefaults({ }); // Set default options
    }
    if (!this.options) {
      console.error("anyPaginator: Options missing. ");
      return this;
    }
    this._currentPage = 1;
    this._numPages = 0;
    this._numItems = 0;

    let elm = $("#"+this.attr('id'));
    if (elm.length) {
      elm.data("paginator", this);
    }
    this.refresh();

    return this;
  }; // reset

  //
  // Getter-setters.
  // Setters call refresh().
  //
  this.currentPage = function(pageNo,callUserFunction)
  {
    if (pageNo === undefined) {
      return this._currentPage;
    }
    if (!Number.isInteger(pageNo) || pageNo > this._numPages) {
      // there is one case when pageNo can be > numPages, when numPages is zero and pageNo is one
      if (!(pageNo === 1 && this._numPages === 0)) {
        console.error("anyPaginator: Invalid value for currentPage, must be integer <= numPages.");
        return this._currentPage; // Illegal value for pageNo
      }
    }
    this._currentPage = pageNo;
    let elm = $("#"+this.attr('id'));
    if (elm.length) {
      elm.data("_currentPage", this._currentPage);
    }
    this.refresh(callUserFunction);
    return this;
  };

  this.numPages = function(nPages,callUserFunction)
  {
    if (nPages === undefined) {
      return this._numPages;
    }
    else
    if (!Number.isInteger(nPages)) {
      console.error("anyPaginator: Invalid value for numPages, must be integer.");
      return this._numPages;
    }
    this._numPages = nPages;
    let elm = $("#"+this.attr('id'));
    if (elm.length) {
      elm.data("_numPages", this._numPages);
    }
    this.refresh(callUserFunction);
    return this;
  }; // numPages

  this.numItems = function(nItems,callUserFunction)
  {
    if (nItems === undefined) {
      return this._numItems;
    }
    else
    if (!Number.isInteger(nItems)) {
      console.error("anyPaginator: Invalid value for numItems, must be integer.");
      return this._numPages;
    }
    if (nItems != this._numItems) {
      let old_ni = this._numItems;
      this._numItems = nItems;
      if (!recalcNumPages(this)) {
        this._numItems = old_ni;
      }
      let elm = $("#"+this.attr('id'));
      if (elm.length) {
        elm.data("_numItems", this._numItems);
      }
      this.refresh(callUserFunction);
    }
    return this;
  }; // numItems

  //
  // Set default options for the paginator
  //
  this.setDefaults = function(opt)
  {
    if (!opt || typeof opt != "object") {
      return this;
    }
    // Merge with defaults
    this.options = $.extend({
      mode:         0,          // 0: buttons, 1: page number, 2: item range
      hideIfOne:    true,       // If true, hide the paginator if there is only one page
      itemsPerPage: 20,         // Number of rows per page
      splitLeft:    3,          // Number of split buttons to the left
      splitMiddle:  3,          // Number of split buttons in the middle
      splitRight:   3,          // Number of split buttons to the right
      pageText:     "Page",     // Text in front of page number for mode == 1
      itemText:     "Item",     // Text in front of item range for mode == 2
      gotoText:     "&crarr;",  // Text on the "go" button
      prevText:     "&lsaquo;", // Text on the "previous" button, ignored if prevIcon is not null
      nextText:     "&rsaquo;", // Text on the "next" button, ignored if nextIcon is not null
      firstText:    "&laquo;",  // Text on the "first" button, ignored if firstIcon is not null
      lastText:     "&raquo;",  // Text on the "last" button, ignored if lastIcon is not null
      gotoIcon:     null,       // Icon on the "go" button instead of gotoText
      prevIcon:     null,       // Icon on the "previous" button instead of prevText
      nextIcon:     null,       // Icon on the "next" button instead of nextText
      firstIcon:    null,       // Icon on the "first" button instead of firstText
      lastIcon:     null,       // Icon on the "last" button instead of lastText
      hideGoto:     false,      // Whether to hide the "goto page" button/input field
      hidePrev:     false,      // Whether to hide the "previous" button
      hideNext:     false,      // Whether to hide the "next" button
      hideFirst:    true,       // Whether to hide the "first" button. Should be "true" if splitLeft == 1
      hideLast:     true,       // Whether to hide the "last" button. Should be "true" if splitRight == 1
    },opt);
    let err = "";
    if (this.options.mode < 0 || this.options.mode > 2) {
      err += "Illegal mode. ";
      this.options.mode = 0;
    }
    if (this.options.splitLeft < 0) {
      err += "Illegal splitLeft. ";
      this.options.splitLeft = 3;
    }
    if (this.options.splitMiddle < 0) {
      err += "Illegal splitMiddle. ";
      this.options.splitMiddle = 3;
    }
    if (this.options.splitRight < 0) {
      err += "Illegal splitRight. ";
      this.options.splitRight = 3;
    }
    if (err !== "") {
      console.error("anyPaginator: "+err+"Setting to default. ");
    }
    let elm = $("#"+this.attr('id'));
    if (elm.length) {
      elm.data("options", this.options);
    }
    return this;
  }; // setDefaults

  //
  // Set or get options.
  // Calls refresh, but does not call user defined click function.
  //
  this.option = function(opt,val)
  {
    if (!opt) {
      // Get the options object
      return this.options;
    }
    if (typeof opt == "object") {
      // Set options in the opt object
      let old_ipp = this.options ? this.options.itemsPerPage : 20;
      this.options = $.extend(this.options,opt);
      if (this.options.itemsPerPage != old_ipp) {
        if (!recalcNumPages(this)) {
          this.options.itemsPerPage = old_ipp;
        }
      }
      this.refresh();
      return this;
    }
    if (val === undefined) {
      // Get the option opt
      if (this.options && opt) {
        return this.options[opt];
      }
      console.error("anyPaginator: option get: Missing this.options. "); // Should never happen
      return this;
    }
    if (typeof opt == "string") {
      // Set the options in val
      if (this.options) {
        let old_ipp = this.options.itemsPerPage;
        this.options[opt] = val;
        if (this.options.itemsPerPage != old_ipp) {
          if (!recalcNumPages(this)) {
            this.options.itemsPerPage = old_ipp;
          }
        }
        this.refresh();
      }
      else {
        console.error("anyPaginator: option set: Missing this.options. "); // Should never happen
      }
      return this;
    }
    console.error("anyPaginator: option: Illegal opt parameter type. ");
    return this;
  }; // option

  //
  // Redraw all the page numbers, ellipsis and navigators
  //
  this.refresh = function(callUserFunction)
  {
    if (!this.options) {
      return this;
    }
    refreshPaginator(this);
    if (callUserFunction && this.options.onClick && this._numPages > 0) {
      // Call user supplied function
      let context = (this.options.context ? this.options.context : this);
      this.options.onClick.call(context,this);
    }
    if (this.options.hideIfOne && this._numPages <= 1 && this.container)
      this.container.hide();
    return this;
  }; // refresh

  //
  // Increase the number of pages and add a button.
  // Does not call refresh(),
  //
  this.addPage = function()
  {
    if (!this.container || !this.options) {
      return this;
    }

    ++this._numPages;

    // Show the new page button, but keep focus
    let cp = this._currentPage;
    this.showPage(this._numPages);
    this._currentPage = cp;
    this.showPage(this._currentPage); // To make sure the button(s) are correct
    toggleHighlight(this,this._numPages,false);
    toggleHighlight(this,this._currentPage,true);

    if (this.options.hideIfOne && this._numPages <= 1 && this.container)
      this.container.hide();

    return this;
  }; // addPage

  //
  // Decrease the number of pages and remove a button.
  // Does not call refresh(),
  //
  this.removePage = function()
  {
    if (!this.container || !this.options) {
      return this;
    }
    if (this._numPages <= 0) {
      return this;
    }
    // Remove the old page button
    removePageNumberButton(this,this._numPages);

    --this._numPages;

    if (this._currentPage > this._numPages) {
      this._currentPage = this._numPages;
    }
    this.showPage(this._currentPage); // To make sure the button(s) are correct
    toggleHighlight(this,this._currentPage,true);

    if (this.options.hideIfOne && this._numPages <= 1 && this.container)
      this.container.hide();

    return this;
  }; // removePage

  //
  // Increase the number of items, possibly adding a page.
  // Does not call refresh(),
  //
  this.addItem = function()
  {
    if (!this.container || !this.options) {
      return this;
    }
    ++this._numItems;

    if (this._numItems % this.options.itemsPerPage == 1) {
      ++this._numPages;
    }

    if (this.options.hideIfOne && this._numPages <= 1 && this.container)
      this.container.hide();

    return this;
  }; // addItem

  //
  // Decrease the number of items, possibly removing a page.
  // Does not call refresh(),
  //
  this.removeItem = function()
  {
    if (!this.container || !this.options) {
      return this;
    }
    if (this._numItems <= 0) {
      return this;
    }
    --this._numItems;

    if (this._numItems % this.options.itemsPerPage === 0) {
      --this._numPages;
      if (this._currentPage > this._numPages) {
        this._currentPage = this._numPages;
      }
    }

    if (this.options.hideIfOne && this._numPages <= 1 && this.container)
      this.container.hide();

    return this;
  }; // removeItem

  //
  // Redraw the paginator with focus on the page pageNo
  //
  this.showPage = function(pageNo)
  {
    if (!this.options) {
      return this;
    }
    toggleHighlight(this,this._currentPage,false);
    if (pageNo !== undefined) {
      this._currentPage = pageNo;
    }
    // Change prev and next buttons if neccessary
    redrawPrevButton(this,1);
    redrawNextButton(this,this._numPages);
    redrawFirstButton(this);
    redrawLastButton(this);

    // Display goto page/input field
    if (!this.options.hideGoto) {
      showGoto(this,pageNo);
    }
    if (pageNo === undefined) {
      pageNo = this._currentPage;
    }
    if (!Number.isInteger(pageNo) || pageNo <= 0) {
      return this; // Return silently if illegal pageNo
    }
    if (this.options.mode == 1) {
      redrawPageView(this,pageNo); // Create page number
    }
    else
    if (this.options.mode == 2) {
      redrawItemRange(this,pageNo); // Create item range
    }
    else { // mode == 0
      // Create page number buttons
      redrawPageNumberButton(this,pageNo);

      let max_split = this.options.splitLeft + this.options.splitMiddle + this.options.splitRight + 3;
      let use_split = this.options.splitLeft > 0 && this.options.splitMiddle > 0 && this.options.splitRight > 0;
      if (this._numPages > max_split && use_split) {
        // The view may need to be modified
        let half       = Math.trunc(this._numPages/2);
        let half_split = Math.trunc(this.options.splitMiddle/2);
        // Remove all buttons except pageNo
        let np = this._numPages;
        for (let i=1; i<=np; i++) {
          if (i != pageNo) {
            removePageNumberButton(this,i);
          }
        }
        // Redraw left buttons
        for (let i=1; i<=this.options.splitLeft; i++) {
          redrawPageNumberButton(this,i);
        }
        // Redraw middle buttons
        for (let i=half-half_split+1; i<=half+half_split+1; i++) {
          redrawPageNumberButton(this,i);
        }
        // Redraw right buttons
        for (let i=this._numPages-this.options.splitRight+1; i<=this._numPages; i++) {
          redrawPageNumberButton(this,i);
        }
        // Redraw main ellipsis buttons
        if (pageNo != half-half_split) {
          redrawPageNumberButton(this,half-half_split,true);
        }
        else {
          redrawPageNumberButton(this,pageNo-1,true);
        }
        if (pageNo != half+half_split+2) {
          redrawPageNumberButton(this,half+half_split+2,true);
        }
        else {
          redrawPageNumberButton(this,pageNo+1,true);
        }
        // Left of left split
        if (pageNo < this.options.splitLeft+1) {
        }
        else
        // Right of left split, left of middle split
        if (pageNo >= this.options.splitLeft+1 && pageNo < half - half_split) {
          if (pageNo == this._currentPage) {
            if (this.options.splitLeft > 2) {
              redrawPageNumberButton(this,this.options.splitLeft - 1,true); // ellipsis
            }
            removePageNumberButton(this,this.options.splitLeft);
            removePageNumberButton(this,pageNo-1);
            let is_ellipsis = $("#anyPaginator_"+(pageNo+1)+this._baseId).attr("data-ellipsis");
            if (!is_ellipsis && pageNo < half - half_split) {
              removePageNumberButton(this,pageNo+1);
            }
            if (pageNo == half - half_split - 1) {
              redrawPageNumberButton(this,pageNo+1); // replace ellipsis
            }
          }
        }
        else
        // Button before middle split
        if (pageNo == half - half_split) {
          if (this.options.splitLeft > 1) {
            redrawPageNumberButton(this,this.options.splitLeft - 1);
            removePageNumberButton(this,this.options.splitLeft);
          }
          let is_ellipsis = $("#anyPaginator_"+(pageNo-1)+this._baseId).attr("data-ellipsis");
          if (!is_ellipsis || this.options.splitLeft == 1) {
            removePageNumberButton(this,pageNo-1);
          }
        }
        else
        // Middle split
        if (pageNo > half - half_split && pageNo < half + half_split + 2) {
          // Redraw middle buttons
          for (let i=half-half_split+1; i<=half+half_split; i++) {
            redrawPageNumberButton(this,i);
          }
        }
        else
        // Button after middle split
        if (pageNo == half + half_split + 2) {
          if (this.options.splitRight > 1) {
            redrawPageNumberButton(this,this._numPages - this.options.splitRight + 2);
            removePageNumberButton(this,this._numPages - this.options.splitRight + 1);
          }
          let is_ellipsis = $("#anyPaginator_"+(pageNo+1)+this._baseId).attr("data-ellipsis");
          if (!is_ellipsis || this.options.splitRight == 1) {
            removePageNumberButton(this,pageNo+1);
          }
        }
        else
        // Right of middle split, left of right split
        if (pageNo > half + half_split + 2 && pageNo <= this._numPages - this.options.splitRight) {
          if (pageNo == this._currentPage) {
            if (this.options.splitRight > 2) {
              redrawPageNumberButton(this,this._numPages - this.options.splitRight + 2,true); // ellipsis
            }
            removePageNumberButton(this,this._numPages - this.options.splitRight + 1);
            removePageNumberButton(this,pageNo+1);
            let is_ellipsis = $("#anyPaginator_"+(pageNo-1)+this._baseId).attr("data-ellipsis");
            if (!is_ellipsis && pageNo > half - half_split) {
              removePageNumberButton(this,pageNo-1);
            }
            if (pageNo == half + half_split + 3) {
              redrawPageNumberButton(this,pageNo-1); // replace ellipsis
            }
          }
        }
        else
        // Right of right split
        if (pageNo > this._numPages - this.options.splitRight) {
        }
      }
      // Highlight new button
      toggleHighlight(this,pageNo,true);
    } // else

    return this;
  }; // showPage

  //
  // Update the paginator when a button is clicked
  //
  this.buttonClicked = function(event)
  {
    let opt = event.data;
    if (!opt) {
      return this;
    }
    if (opt.clickedPage) {
      // Remove highlight from old button
      toggleHighlight(this,this._currentPage,false);
      // Find new page
      switch (opt.clickedPage) {
        case "prev":
          if (this._currentPage > 1) {
            --this._currentPage;
          }
          break;
        case "next":
          if (this._currentPage < this._numPages) {
            ++this._currentPage;
          }
          break;
        case "first":
          this._currentPage = 1;
          break;
        case "last":
          this._currentPage = this._numPages;
          break;
        default:
          if (Number.isInteger(opt.clickedPage)) {
            this._currentPage = opt.clickedPage;
          }
          break;
      } // switch
      // Show new page
      this.showPage(this._currentPage);
    }
    if (opt.onClick) {
      // Update the element with the new _currentPage
      let elm = $("#"+this.attr('id'));
      if (elm.length) {
        elm.data("paginator",this);
      }
      // Call user supplied function
      let context = (opt.context ? opt.context : this);
      this.clickedPage = opt.clickedPage;
      opt.onClick.call(context,this);
      delete this.clickedPage;
    }
  }; // buttonClicked

  //
  // Update the paginator when the go button is clicked or enter is pressed in the input field
  //
  this.gotoClicked = function(event)
  {
    let opt = event.data;
    if (!opt || !this.options) {
      return this;
    }
    // Find new page
    let num = parseInt($("#anyPaginator_goto_inp"+this._baseId).val());
    if (Number.isInteger(num)) {
      toggleHighlight(this,this._currentPage,false); // Remove highlight from old button
      if (this.options.mode === 0 || this.options.mode == 1) {
        if (num >= 1 && num <= this._numPages) {
          this._currentPage = num;
          opt.clickedPage = this._currentPage;
        }
      }
      else { // mode == 2
        let num_items = this._numPages * this.options.itemsPerPage;
        if (num >= 1 && num <= num_items) {
          this._currentPage = Math.trunc((num-1)/this.options.itemsPerPage) + 1;
        }
      }
      // Show new page
      this.showPage(this._currentPage);
      if (opt.onClick) {
        // Call user supplied function
        let context = opt.context ? opt.context : this;
        this.clickedPage = opt.clickedPage;
        opt.onClick.call(context,this);
        delete this.clickedPage;
      }
    }
  }; // gotoClicked

  /////////////////////
  // Private methods //
  /////////////////////

  function recalcNumPages(self)
  {
    if (!self.options) {
      return false;
    }
    if (self._numItems >= 0 && self.options.itemsPerPage) {
      self._numPages = Math.trunc((self._numItems - 1) / self.options.itemsPerPage) + 1;
      if (self.options.hideIfOne && self._numPages <= 1 && self.container)
        self.container.hide();
      return true;
    }
    else {
      console.error("anyPaginator: numItems not set or itemsPerPage==0, cannot recalculate numPages. ");
      return false;
    }
  } // recalcNumPages

  function refreshPaginator(self)
  {
    self.container = redrawPaginatorContainer(self);
    let cp = self._currentPage;
    let np = self._numPages;
    for (let page_no=1; page_no<=np; page_no++) {
      self.showPage(page_no);
    }
    self.showPage(cp);
    return self;
  } // refreshPaginator

  function redrawPaginatorContainer(self)
  {
    self.container_id = "anyPaginator_container"+self._baseId;
    self.container = $("#"+self.container_id);
    if (self.container.length) {
      self.container.remove();
    }
    self.container = $("<div id='"+self.container_id+"' class='any-paginator-container'></div>");
    self.append(self.container);
    return self.container;
  } // redrawPaginatorContainer

  function redrawPrevButton(self,first_page)
  {
    if (!self.container || !self.options || first_page != 1) {
      return self;
    }
    let pagestr = "prev";
    let active = self._currentPage > 1;
    let act_class = "any-paginator-"+pagestr+" ";
    act_class += !active ? "any-paginator-inactive" : "";
    let btn_text = "";
    if (!self.options.prevIcon) {
      btn_text = self.options.prevText;
    }
    else {
      act_class += " "+self.options.prevIcon;
    }
    let btn_id = "anyPaginator_"+pagestr+self._baseId;
    if ($("#"+btn_id)) {
      $("#"+btn_id).remove();
    }
    let btn_div = $("<div id='"+btn_id+"' class='any-paginator-btn "+act_class+" noselect'>"+btn_text+"</div>");
    self.container.prepend(btn_div);
    toggleActive(self,btn_div,pagestr,active);
    if (self.options.hidePrev) {
      btn_div.hide();
    }
    return self;
  } // redrawPrevButton

  function redrawNextButton(self,last_page)
  {
    if (!self.container || !self.options) {
      return self;
    }
    let pagestr = "next";
    let active  = self._currentPage < last_page;
    let act_class = "any-paginator-"+pagestr+" ";
    act_class += !active ? "any-paginator-inactive" : "";
    let btn_text = "";
    if (!self.options.nextIcon) {
      btn_text = self.options.nextText;
    }
    else {
      act_class += " "+self.options.nextIcon;
    }
    let btn_id = "anyPaginator_"+pagestr+self._baseId;
    if ($("#"+btn_id)) {
      $("#"+btn_id).remove();
    }
    let btn_div = $("<div id='"+btn_id+"' class='any-paginator-btn "+act_class+" noselect'>"+btn_text+"</div>");
    self.container.append(btn_div);
    toggleActive(self,btn_div,pagestr,active);
    if (self.options.hideNext) {
      btn_div.hide();
    }
    return self;
  } // redrawNextButton

  function redrawFirstButton(self)
  {
    if (!self.container || !self.options) {
      return self;
    }
    let pagestr = "first";
    let active  = self._currentPage > 1;
    let act_class = "any-paginator-"+pagestr+" ";
    act_class += !active ? "any-paginator-inactive " : "";
    let btn_text = "";
    if (!self.options.firstIcon) {
      btn_text = self.options.firstText;
    }
    else {
      act_class += " "+self.options.firstIcon;
    }
    let btn_id = "anyPaginator_"+pagestr+self._baseId;
    if ($("#"+btn_id)) {
      $("#"+btn_id).remove();
    }
    let btn_div = $("<div id='"+btn_id+"' class='any-paginator-btn "+act_class+" noselect'>"+btn_text+"</div>");
    self.container.prepend(btn_div);
    toggleActive(self,btn_div,pagestr,active);
    if (self.options.hideFirst) {
      btn_div.hide();
    }
    return self;
  } // redrawFirstButton

  function redrawLastButton(self)
  {
    if (!self.container || !self.options) {
      return self;
    }
    let pagestr = "last";
    let active  = self._currentPage < self._numPages;
    let act_class = "any-paginator-"+pagestr+" ";
    act_class += !active ? "any-paginator-inactive" : "";
    let btn_text = "";
    if (!self.options.lastIcon) {
      btn_text = self.options.lastText;
    }
    else {
      act_class += " "+self.options.lastIcon;
    }
    let btn_id = "anyPaginator_"+pagestr+self._baseId;
    if ($("#"+btn_id)) {
      $("#"+btn_id).remove();
    }
    let btn_div = $("<div id='"+btn_id+"' class='any-paginator-btn "+act_class+" noselect'>"+btn_text+"</div>");
    self.container.append(btn_div);
    toggleActive(self,btn_div,pagestr,active);
    if (self.options.hideLast) {
      btn_div.hide();
    }
    return self;
  } // redrawLastButton

  function toggleActive(self,btn,pagestr,active)
  {
    if (!self.options) {
      return false;
    }
    if (active) {
      // The button should be active
      let click_opt = {...self.options};
      click_opt.clickedPage = pagestr;
      btn.off("click").on("click", click_opt, $.proxy(self.buttonClicked,self));
    }
    else {
      // The button should be inactive
      btn.off("click");
      btn.css("cursor","default");
    }
  } // toggleActive

  function toggleHighlight(self,pageNo,toggle)
  {
    let pg_div = $("#anyPaginator_"+pageNo+self._baseId);
    if (pg_div.length) {
      if (toggle) {
        pg_div.css("border","2px solid #fc5200");
        pg_div.css("font-weight", "bolder");
      }
      else {
        pg_div.css("border","1px solid #fc5200");
        pg_div.css("font-weight", "normal");
      }
    }
  } // toggleHighlight

  function redrawPageNumberButton(self,pageNo,isEllipsis)
  {
    if (!self.container || !self.options) {
      return self;
    }
    pageNo = parseInt(pageNo);
    removePageNumberButton(self,pageNo);
    let ellipsis_class = isEllipsis ? "any-paginator-ellipsis" : "any-paginator-num";
    let ellipsis_text  = "";
    if (!self.options.ellipsisIcon) {
      ellipsis_text = self.options.ellipsisText ? self.options.ellipsisText : "...";
    }
    else
    if (isEllipsis) {
      ellipsis_class += " "+self.options.ellipsisIcon;
    }
    let attr   = isEllipsis ? "data-ellipsis='1'" : "";
    let str    = isEllipsis ? ellipsis_text       : pageNo;
    let btn_id = "anyPaginator_"+pageNo+self._baseId;
    let pg_div = $("<div id='"+btn_id+"' class='any-paginator-btn "+ellipsis_class+" noselect' "+attr+">"+str+"</div>");
    let ins    = $("#anyPaginator_"+(pageNo-1)+self._baseId);
    if (ins.length) {
      pg_div.insertAfter(ins);
    }
    else {
      ins = $("#anyPaginator_"+(pageNo+1)+self._baseId);
      if (ins.length) {
        pg_div.insertBefore(ins);
      }
      else {
        // Search left side
        for (let i=pageNo-1; i>=1; i--) {
          ins = $("#anyPaginator_"+i+self._baseId);
          if (ins.length) {
            break;
          }
        }
        if (ins.length) {
          pg_div.insertAfter(ins);
        }
        else {
          // Search right side
          let np = self._numPages;
          for (let i=pageNo+1; i<np; i++) {
            ins = $("#anyPaginator_"+i+self._baseId);
            if (ins.length) {
              break;
            }
          }
          if (ins.length) {
            pg_div.insertBefore(ins);
          }
        }
        if (!ins.length) {
          if (pageNo <= self._numPages) {
            pg_div.insertAfter($("#anyPaginator_prev"+self._baseId));
          }
          else {
            pg_div.insertBefore($("#anyPaginator_next"+self._baseId));
          }
        }
      } // else
    } // else
    if (!isEllipsis) {
      // Register click handler
      let click_opt = {...self.options};
      click_opt.clickedPage = pageNo;
      pg_div.off("click").on("click", click_opt, $.proxy(self.buttonClicked,self));
    }
    return self;
  } // redrawPageNumberButton

  function removePageNumberButton(self,pageNo)
  {
    let pg_div = $("#anyPaginator_"+pageNo+self._baseId);
    if (pg_div.length) {
      pg_div.remove();
    }
    return self;
  } // removePageNumberButton

  function redrawItemRange(self,pageNo)
  {
    if (!self.container || !self.options) {
      return self;
    }
    let div_id = "anyPaginator_itemrange"+self._baseId;
    if ($("#"+div_id)) {
      $("#"+div_id).remove();
    }
    let label = self.options.itemText ? self.options.itemText : "";
    let from = self.options.itemsPerPage * (pageNo-1) + 1;
    let to   = self.options.itemsPerPage * pageNo;
    if (self._numItems && to > self._numItems) {
      to = self._numItems;
    }
    let num  = self._numItems ? self._numItems : self.options.itemsPerPage * self._numPages;
    let str = label+" "+from+"-"+to+" of "+num;
    let div = $("<div id='"+div_id+"' class='any-paginator-item noselect'>"+str+"</div>");
    let ins = $("#anyPaginator_prev"+self._baseId);
    if (!ins.length) {
      ins = $("#anyPaginator_first"+self._baseId);
    }
    if (ins.length) {
      div.insertAfter(ins);
    }
    else {
      self.container.prepend(div);
    }
  } // redrawItemRange

  function redrawPageView(self,pageNo)
  {
    if (!self.container || !self.options) {
      return self;
    }
    let div_id = "anyPaginator_pageview"+self._baseId;
    if ($("#"+div_id)) {
      $("#"+div_id).remove();
    }
    let label = self.options.pageText ? self.options.pageText : "";
    let str = label+" "+pageNo+"/"+self._numPages;
    let div = $("<div id='"+div_id+"' class='any-paginator-page noselect'>"+str+"</div>");
    let ins = $("#anyPaginator_prev"+self._baseId);
    if (!ins.length) {
      ins = $("#anyPaginator_first"+self._baseId);
    }
    if (ins.length) {
      div.insertAfter(ins);
    }
    else {
      self.container.prepend(div);
    }
  } // pagenumber

  function showGoto(self,pageNo)
  {
    if (!self.container || !self.options) {
      return self;
    }
    let div_id = "anyPaginator_goto"+self._baseId;
    if ($("#"+div_id)) {
      $("#"+div_id).remove();
    }
    let go_class = "";
    let go_text  = "";
    if (!self.options.gotoIcon) {
      go_text = self.options.gotoText ? self.options.gotoText : "Go";
    }
    else {
      go_class += " "+self.options.gotoIcon;
    }
    let inp_id = "anyPaginator_goto_inp"+self._baseId;
    let btn_id = "anyPaginator_goto_btn"+self._baseId;
    let go_inp = $("<input id='"+inp_id+"' class='any-paginator-goto-inp' type='text'></input>");
    let go_btn = $("<div   id='"+btn_id+"' class='any-paginator-goto-btn "+go_class+"'>"+go_text+"</div>");
    let go_div = $("<div   id='"+div_id+"' class='any-paginator-goto noselect'></div>");
    go_div.append(go_inp);
    go_div.append(go_btn);
    self.container.append(go_div);
    let click_opt = {...self.options};
    go_btn.off("click").on("click", click_opt, $.proxy(self.gotoClicked,self));
    go_inp.keypress(function (e) { if (e.which == 13) { self.gotoClicked({data:click_opt}); } });
  } // showGoto

  /////////////////////////////////////////
  // Call methods
  /////////////////////////////////////////

  let options = args && args.length ? args[0] : null;

  if (cmd == "reset" || !cmd || typeof cmd == "object") {
    return this.reset(cmd);
  }
  // Associate the options with the element where the paginator lives
  let elm = $("#"+this.attr('id'));
  if (elm.length) {
    if (this.options) {
      elm.data("paginator", this);
    }
    else {
      let pag = elm.data("paginator");
      if (pag) {
        this.options      = pag.options;
        this._baseId      = pag._baseId;
        this._currentPage = pag._currentPage;
        this._numPages    = pag._numPages;
        this._numItems    = pag._numItems;
      }
    }
  }
  if (cmd == "option") {
    return this.option(options,args[1]);
  }
  if (cmd == "currentPage") {
    return this.currentPage(options);
  }
  if (cmd == "numPages") {
    return this.numPages(options);
  }
  if (cmd == "numItems") {
    return this.numItems(options);
  }
  if (cmd == "refresh") {
    return this.refresh(options);
  }
  if (cmd == "page") {
    if (options == "remove")
      return this.removePage();
    else
      return this.addPage();
  }
  if (cmd == "item") {
    if (options == "remove")
      return this.removeItem(args[1]);
    else
      return this.addItem(options);
  }
  if (cmd == "show") {
    return this.showPage(options);
  }
  return this;
}; // anyPaginator

})( $ );
//@ sourceURL=anyPaginator.js