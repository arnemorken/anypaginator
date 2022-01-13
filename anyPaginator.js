"use strict";
/****************************************************************************************
 *
 * anyPaginator is copyright (C) 2021-2022 Arne D. Morken and Balanse Software.
 *
 * License: AGPLv3.0 for open source use or anyPaginator Commercial License for commercial use.
 * Get licences here: http://balanse.info/anypaginator/license/ (coming soon).
 *
 * See also the anyList project: https://github.com/arnemorken/anylist
 *
 ****************************************************************************************/

(function ( $ ) {

$.fn.anyPaginator = function (cmd,...args)
{
  ////////////////////
  // Public methods //
  ////////////////////

  //
  // Initialize / reset options and properties and redraw
  //
  this.reset = function(opt)
  {
    if (opt && typeof opt == "object")
      this.setDefaults(opt); // Set user-defined options
    else
      this.setDefaults({ }); // Set default options
    if (!this.options) {
      console.error("anyPaginator: Options missing. ");
      return this;
    }
    this.numPages = 0;
    this.numItems = 0;
    this.currentPage = 1;

    this.refresh();

    return this;
  }; // reset

  //
  // Getters
  //
  this.getCurrentPage = function() { return this.currentPage; };
  this.getNumPages    = function() { return this.numPages; };
  this.getNumItems    = function() { return this.numItems; };

  //
  // Setters
  //
  this.setCurrentPage = function(n) { if (n>this.numPages) return;
                                      this.currentPage = n; this.refresh(); }
  this.setNumPages    = function(n) { this.numPages    = n; this.refresh(); }
  this.setNumItems    = function(n) { this.numItems    = n; recalcNumPages(this); }

  //
  // Set default options for the paginator
  //
  this.setDefaults = function(opt)
  {
    if (!opt || typeof opt != "object")
      return this;
    // Merge with defaults
    this.options = $.extend({
      mode:         0,          // 0: buttons, 1: page number, 2: item range
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
    if (this.options.mode < 0 || this.options.mode > 2)
      err += "Illegal mode. ";
    if (this.options.splitLeft < 0)
      err += "Illegal splitLeft. ";
    if (this.options.splitMiddle < 0)
      err += "Illegal splitMiddle. ";
    if (this.options.splitRight < 0)
      err += "Illegal splitRight. ";
    if (err != "")
      console.error("anyPaginator: "+err);
    return this;
  }; // setDefaults

  this.setOptions = function(opt)
  {
    if (!opt || typeof opt != "object")
      return this;
    let old_ipp = this.options.itemsPerPage;
    this.options = $.extend(this.options,opt);
    if (opt.itemsPerPage)
      recalcNumPages(this);
    this.refresh();
    return this;
  }; // setOptions

  //
  // Redraw all the page numbers, ellipsis and navigators
  //
  this.refresh = function(args)
  {
    this.container = redrawPaginatorContainer(this);
    let cp = this.currentPage;
    let np = this.numPages;
    for (let page_no=1; page_no<=np; page_no++)
      this.showPage(page_no);
    this.showPage(cp);
    if (this.options.onClick && this.numPages > 0) {
      // Call user supplied function
      let context = this.options.context ? this.options.context : this;
      this.options.onClick.call(context,args);
    }
  }; // refresh

  //
  // Increase the number of pages and add a button
  //
  this.addPage = function()
  {
    if (!this.container || !this.options)
      return this;

    ++this.numPages;

    // Show the new page button, then redisplay current page
    let cp = this.currentPage;
    this.showPage(this.numPages);
    this.showPage(cp);

    // Highlight the current page button
    if (this.options.mode == 0) {
      toggleHighlight(this,this.numPages,false);
      toggleHighlight(this,this.currentPage,true);
    }
    return this;
  } // addPage

  //
  // Decrease the number of pages and remove a button
  //
  this.removePage = function()
  {
    if (!this.container || !this.options)
      return this;

    removePageNumberButton(this,this.numPages);

    --this.numPages;

    if (this.currentPage > this.numPages)
      this.currentPage = this.numPages;

    this.refresh();
  }; // removePage

  //
  // Increase the number of items, possibly adding a page
  //
  this.addItem = function()
  {
    if (!this.container || !this.options)
      return this;

    ++this.numItems;
    recalcNumPages(this);
  }; // addItem

  //
  // Decrease the number of items, possibly removing a page
  //
  this.removeItem = function()
  {
    if (!this.container || !this.options)
      return this;

    --this.numItems;
    recalcNumPages(this);
  }; // addItem

  function recalcNumPages(self)
  {
    let np = self.numPages;
    self.numPages = Math.trunc(self.numItems / self.options.itemsPerPage);
    if (self.numItems % self.options.itemsPerPage)
      self.numPages +=  1;
    self.refresh();
    return self;
  } // recalcNumPages

  //
  // Redraw the paginator with focus on the page pageNo
  //
  this.showPage = function(pageNo)
  {
    toggleHighlight(this,this.currentPage,false);
    this.currentPage = pageNo;

    // Change prev and next buttons if neccessary
    redrawPrevButton(this,1);
    redrawNextButton(this,this.numPages);
    redrawFirstButton(this);
    redrawLastButton(this);

    // Display goto page/input field
    if (!this.options.hideGoto)
      showGoto(this,pageNo);

    if (pageNo == undefined)
      pageNo = this.currentPage;

    if (!Number.isInteger(pageNo) || pageNo <= 0)
      return this; // Return silently if illegal pageNo

    if (this.options.mode) {
      if (this.options.mode == 1)
        redrawPageView(this,pageNo); // Create page number
      else
      if (this.options.mode == 2)
        redrawItemRange(this,pageNo); // Create item range
    }
    else {
      // Create page number buttons
      redrawPageNumberButton(this,pageNo);

      let max_split = this.options.splitLeft + this.options.splitMiddle + this.options.splitRight + 3;
      let use_split = this.options.splitLeft > 0 && this.options.splitMiddle > 0 && this.options.splitRight > 0;
      if (this.numPages > max_split && use_split) {
        // The view may need to be modified
        let half       = Math.trunc(this.numPages/2);
        let half_split = Math.trunc(this.options.splitMiddle/2);
        // Remove all buttons except pageNo
        let np = this.numPages;
        for (let i=1; i<=np; i++)
          if (i != pageNo)
            removePageNumberButton(this,i);
        // Redraw left buttons
        for (let i=1; i<=this.options.splitLeft; i++)
          redrawPageNumberButton(this,i);
        // Redraw middle buttons
        for (let i=half-half_split+1; i<=half+half_split+1; i++)
          redrawPageNumberButton(this,i);
        // Redraw right buttons
        for (let i=this.numPages-this.options.splitRight+1; i<=this.numPages; i++)
          redrawPageNumberButton(this,i);
        // Redraw main ellipsis buttons
        if (pageNo != half-half_split)
          redrawPageNumberButton(this,half-half_split,true);
        else
          redrawPageNumberButton(this,pageNo-1,true);
        if (pageNo != half+half_split+2)
          redrawPageNumberButton(this,half+half_split+2,true);
        else
          redrawPageNumberButton(this,pageNo+1,true);
        // Left of left split
        if (pageNo < this.options.splitLeft+1) {
        }
        else
        // Right of left split, left of middle split
        if (pageNo >= this.options.splitLeft+1 && pageNo < half - half_split) {
          if (pageNo == this.currentPage) {
            if (this.options.splitLeft > 2)
              redrawPageNumberButton(this,this.options.splitLeft - 1,true); // ellipsis
            removePageNumberButton(this,this.options.splitLeft);
            removePageNumberButton(this,pageNo-1);
            let is_ellipsis = $("#anyPaginator_"+(pageNo+1)).attr("data-ellipsis");
            if (!is_ellipsis && pageNo < half - half_split)
              removePageNumberButton(this,pageNo+1);
            if (pageNo == half - half_split - 1)
              redrawPageNumberButton(this,pageNo+1); // replace ellipsis
          }
        }
        else
        // Button before middle split
        if (pageNo == half - half_split) {
          if (this.options.splitLeft > 1) {
            redrawPageNumberButton(this,this.options.splitLeft - 1);
            removePageNumberButton(this,this.options.splitLeft);
          }
          let is_ellipsis = $("#anyPaginator_"+(pageNo-1)).attr("data-ellipsis");
          if (!is_ellipsis || this.options.splitLeft == 1)
            removePageNumberButton(this,pageNo-1);
        }
        else
        // Middle split
        if (pageNo > half - half_split && pageNo < half + half_split + 2) {
          // Redraw middle buttons
          for (let i=half-half_split+1; i<=half+half_split; i++)
            redrawPageNumberButton(this,i);
        }
        else
        // Button after middle split
        if (pageNo == half + half_split + 2) {
          if (this.options.splitRight > 1) {
            redrawPageNumberButton(this,this.numPages - this.options.splitRight + 2);
            removePageNumberButton(this,this.numPages - this.options.splitRight + 1);
          }
          let is_ellipsis = $("#anyPaginator_"+(pageNo+1)).attr("data-ellipsis");
          if (!is_ellipsis || this.options.splitRight == 1)
            removePageNumberButton(this,pageNo+1);
        }
        else
        // Right of middle split, left of right split
        if (pageNo > half + half_split + 2 && pageNo <= this.numPages - this.options.splitRight) {
          if (pageNo == this.currentPage) {
            if (this.options.splitRight > 2)
              redrawPageNumberButton(this,this.numPages - this.options.splitRight + 2,true); // ellipsis
            removePageNumberButton(this,this.numPages - this.options.splitRight + 1);
            removePageNumberButton(this,pageNo+1);
            let is_ellipsis = $("#anyPaginator_"+(pageNo-1)).attr("data-ellipsis");
            if (!is_ellipsis && pageNo > half - half_split)
              removePageNumberButton(this,pageNo-1);
            if (pageNo == half + half_split + 3)
              redrawPageNumberButton(this,pageNo-1); // replace ellipsis
          }
        }
        else
        // Right of right split
        if (pageNo > this.numPages - this.options.splitRight) {
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
    if (!opt)
      return this;
    if (opt.clickedPage) {
      // Remove highlight from old button
      toggleHighlight(this,this.currentPage,false);
      // Find new page
      switch (opt.clickedPage) {
        case "prev":
          if (this.currentPage > 1)
            --this.currentPage;
          break;
        case "next":
          if (this.currentPage < this.numPages)
            ++this.currentPage;
          break;
        case "first":
          this.currentPage = 1;
          break;
        case "last":
          this.currentPage = this.numPages;
          break;
        default:
          if (Number.isInteger(opt.clickedPage)) {
            this.currentPage = opt.clickedPage;
          }
          break;
      } // switch
      // Show new page
      this.showPage(this.currentPage);
    }
    if (opt.onClick) {
      // Call user supplied function
      let context = opt.context ? opt.context : this;
      opt.onClick.call(context,event.data);
    }
  }; // buttonClicked

  //
  // Update the paginator when the go button is clicked or enter is pressed in the input field
  //
  this.gotoClicked = function(event)
  {
    let opt = event.data;
    if (!opt)
      return this;
    // Find new page
    let num = parseInt($("#anyPaginator_goto_inp").val());
    if (Number.isInteger(num)) {
      toggleHighlight(this,this.currentPage,false); // Remove highlight from old button
      if (this.options.mode == 0 || this.options.mode == 1) {
        if (num >= 1 && num <= this.numPages) {
          this.currentPage = num;
          opt.clickedPage = this.currentPage;
        }
      }
      else { // mode == 2
        let num_items = this.numPages * this.options.itemsPerPage;
        if (num >= 1 && num <= num_items)
          this.currentPage = Math.trunc((num-1)/this.options.itemsPerPage) + 1;
      }
      // Show new page
      this.showPage(this.currentPage);
      if (opt.onClick) {
        // Call user supplied function
        let context = opt.context ? opt.context : this;
        opt.onClick.call(context,event.data);
      }
    }
  }; // gotoClicked

  /////////////////////
  // Private methods //
  /////////////////////

  function redrawPaginatorContainer(self)
  {
    let container_id = "anyPaginator_container";
    self.container = $("#"+container_id);
    if (self.container.length)
      self.container.remove();
    self.container = $("<div id='"+container_id+"' class='any-paginator-container'></div>");
    self.append(self.container);
    return self.container;
  }; // redrawPaginatorContainer

  function redrawPrevButton(self,first_page)
  {
    if (!self.container || !self.options || first_page != 1)
      return self;
    let pagestr = "prev";
    let active = self.currentPage > 1;
    let act_class = "any-paginator-"+pagestr+" ";
    act_class += !active ? "any-paginator-inactive" : "";
    let btn_text = "";
    if (!self.options.prevIcon)
      btn_text = self.options.prevText;
    else
      act_class += " "+self.options.prevIcon;
    let btn_id = "anyPaginator_"+pagestr;
    if ($("#"+btn_id))
      $("#"+btn_id).remove();
    let btn_div = $("<div id='"+btn_id+"' class='any-paginator-btn "+act_class+" noselect'>"+btn_text+"</div>");
    self.container.prepend(btn_div);
    toggleActive(self,btn_div,pagestr,active);
    if (self.options.hidePrev)
      btn_div.hide();
    return self;
  } // redrawPrevButton

  function redrawNextButton(self,last_page)
  {
    if (!self.container || !self.options)
      return self;
    let pagestr = "next";
    let active  = self.currentPage < last_page;
    let act_class = "any-paginator-"+pagestr+" ";
    act_class += !active ? "any-paginator-inactive" : "";
    let btn_text = "";
    if (!self.options.nextIcon)
      btn_text = self.options.nextText;
    else
      act_class += " "+self.options.nextIcon;
    let btn_id = "anyPaginator_"+pagestr;
    if ($("#"+btn_id))
      $("#"+btn_id).remove();
    let btn_div = $("<div id='"+btn_id+"' class='any-paginator-btn "+act_class+" noselect'>"+btn_text+"</div>");
    self.container.append(btn_div);
    toggleActive(self,btn_div,pagestr,active);
    if (self.options.hideNext)
      btn_div.hide();
    return self;
  } // redrawNextButton

  function redrawFirstButton(self)
  {
    if (!self.container || !self.options)
      return self;
    let pagestr = "first";
    let active  = self.currentPage > 1;
    let act_class = "any-paginator-"+pagestr+" ";
    act_class += !active ? "any-paginator-inactive " : "";
    let btn_text = "";
    if (!self.options.firstIcon)
      btn_text = self.options.firstText;
    else
      act_class += " "+self.options.firstIcon;
    let btn_id = "anyPaginator_"+pagestr;
    if ($("#"+btn_id))
      $("#"+btn_id).remove();
    let btn_div = $("<div id='"+btn_id+"' class='any-paginator-btn "+act_class+" noselect'>"+btn_text+"</div>");
    self.container.prepend(btn_div);
    toggleActive(self,btn_div,pagestr,active);
    if (self.options.hideFirst)
      btn_div.hide();
    return self;
  } // redrawFirstButton

  function redrawLastButton(self)
  {
    if (!self.container || !self.options)
      return self;
    let pagestr = "last";
    let active  = self.currentPage < self.numPages;
    let act_class = "any-paginator-"+pagestr+" ";
    act_class += !active ? "any-paginator-inactive" : "";
    let btn_text = "";
    if (!self.options.lastIcon)
      btn_text = self.options.lastText;
    else
      act_class += " "+self.options.lastIcon;
    let btn_id = "anyPaginator_"+pagestr;
    if ($("#"+btn_id))
      $("#"+btn_id).remove();
    let btn_div = $("<div id='"+btn_id+"' class='any-paginator-btn "+act_class+" noselect'>"+btn_text+"</div>");
    self.container.append(btn_div);
    toggleActive(self,btn_div,pagestr,active);
    if (self.options.hideLast)
      btn_div.hide();
    return self;
  } // redrawLastButton

  function toggleActive(self,btn,pagestr,active)
  {
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
    let pg_div = $("#anyPaginator_"+pageNo);
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
    if (!self.container || !self.options)
      return self;
    pageNo = parseInt(pageNo);
    removePageNumberButton(self,pageNo);
    let ellipsis_class = isEllipsis ? "any-paginator-ellipsis" : "any-paginator-num";
    let ellipsis_text  = "";
    if (!self.options.ellipsisIcon)
      ellipsis_text = self.options.ellipsisText ? self.options.ellipsisText : "...";
    else
    if (isEllipsis)
      ellipsis_class += " "+self.options.ellipsisIcon;
    let attr = isEllipsis ? "data-ellipsis='1'" : "";
    let str  = isEllipsis ? ellipsis_text       : pageNo;
    let pg_div = $("<div id='anyPaginator_"+pageNo+"' class='any-paginator-btn "+ellipsis_class+" noselect' "+attr+">"+str+"</div>");
    let ins = $("#anyPaginator_"+(pageNo-1));
    if (ins.length)
      pg_div.insertAfter(ins);
    else {
      ins = $("#anyPaginator_"+(pageNo+1));
      if (ins.length)
        pg_div.insertBefore(ins);
      else {
        // Search left side
        for (let i=pageNo-1; i>=1; i--) {
          ins = $("#anyPaginator_"+i);
          if (ins.length)
            break;
        }
        if (ins.length) {
          pg_div.insertAfter(ins);
        }
        else {
          // Search right side
          let np = self.numPages;
          for (let i=pageNo+1; i<np; i++) {
            ins = $("#anyPaginator_"+i);
            if (ins.length)
              break;
          }
          if (ins.length) {
            pg_div.insertBefore(ins);
          }
        }
        if (!ins.length) {
          if (pageNo <= self.numPages)
            pg_div.insertAfter($("#anyPaginator_prev"));
          else
            pg_div.insertBefore($("#anyPaginator_next"));
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
    let pg_div = $("#anyPaginator_"+pageNo);
    if (pg_div.length)
      pg_div.remove();
    return self;
  } // removePageNumberButton

  function redrawItemRange(self,pageNo)
  {
    if (!self.container || !self.options)
      return self;
    let div_id = "anyPaginator_itemrange";
    if ($("#"+div_id))
      $("#"+div_id).remove();
    let label = self.options.itemText ? self.options.itemText : "";
    let from = self.options.itemsPerPage * (pageNo-1) + 1;
    let to   = self.options.itemsPerPage * pageNo;
    let num  = self.options.itemsPerPage * self.numPages;
    let str = label+" "+from+"-"+to+" of "+num;
    let div = $("<div id='"+div_id+"' class='any-paginator-compact noselect'>"+str+"</div>");
    self.container.append(div);
  } // redrawItemRange

  function redrawPageView(self,pageNo)
  {
    if (!self.container || !self.options)
      return self;
    let div_id = "anyPaginator_pageview";
    if ($("#"+div_id))
      $("#"+div_id).remove();
    let label = self.options.pageText ? self.options.pageText : "";
    let str = label+" "+pageNo+"/"+self.numPages;
    let div = $("<div id='"+div_id+"' class='any-paginator-compact noselect'>"+str+"</div>");
    self.container.append(div);
  } // pagenumber

  function showGoto(self,pageNo)
  {
    if (!self.container || !self.options)
      return self;
    let div_id = "anyPaginator_goto";
    if ($("#"+div_id))
      $("#"+div_id).remove();

    let go_class = "";
    let go_text  = "";
    if (!self.options.gotoIcon)
      go_text = self.options.gotoText ? self.options.gotoText : "Go"
    else
      go_class += " "+self.options.gotoIcon;
    let go_inp = $("<input id='anyPaginator_goto_inp' type='text'></input>");
    let go_btn = $("<div   id='anyPaginator_goto_btn' class='"+go_class+"'>"+go_text+"</div>");
    let go_div = $("<div id='"+div_id+"' class='any-paginator-goto noselect'></div>");
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

  if (cmd == "reset" || !cmd || typeof cmd == "object")
    this.reset(cmd);
  else
  if (cmd == "option")
    this.setOptions(options);
  else
  if (cmd == "refresh")
    this.refresh(args);
  else
  if (cmd == "page")
    this.addPage();
  else
  if (cmd == "item")
    this.addItem();
  else
  if (cmd == "remove" && args && args[0] == "page")
    this.removePage();
  else
  if (cmd == "remove" && args && args[0] == "item")
    this.removeItem();
  else
  if (cmd == "show")
    this.showPage(options);

  return this;
}; // anyPaginator

})( jQuery );
//@ sourceURL=anyPaginator.js