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

$.fn.anyPaginator = function (opt,args)
{
  ////////////////////
  // Public methods //
  ////////////////////

  //
  // Initialize options and properties
  //
  this.initialize = function(opt)
  {
    if (opt && typeof opt == "object")
      this.setOptions(opt); // Set user-defined options
    else
      this.setOptions({}); // Set default options
    if (!this.options) {
      // Should never happen
      console.error("anyPaginator: Options missing. ");
      return this;
    }
    if (this.options.mode < 0 || this.options.mode > 2) {
      console.error("anyPaginator: Illegal mode. ");
      return this;
    }
    if (this.options.rowsPerPage <= 0 ||
        this.options.splitLeft   <  0 ||
        this.options.splitMiddle <  0 ||
        this.options.splitRight  <  0) {
      console.error("anyPaginator: Illegal number in options. ");
      return this;
    }
    this.reset();
    return this;
  }; // initialize

  //
  // Remove all pages, reset currentPage and numPages and create prev/next buttons
  //
  this.reset = function()
  {
    if (!this.currentPage)
      this.currentPage = 1;
    this.numPages = 0;
    this.pager    = redrawPaginatorContainer(this);
    redrawPrevButton(this,1);
    redrawNextButton(this,this.numPages);
  }; // reset

  //
  // Set options for the plugin
  //
  this.setOptions = function(opt)
  {
    if (!opt || typeof opt != "object")
      return this;
    // Merge with defaults
    this.options = $.extend({
      mode:        0,         // 0: buttons, 1: item range, 2: page number
      rowsPerPage: 20,        // Number of rows per page
      gotoText:    "Go",      // Text on the "go" button
      prevText:    "&laquo;", // Text on the "previous" button, ignored if prevIcon is not null
      nextText:    "&raquo;", // Text on the "next" button, ignored if nextIcon is not null
      firstText:   "|<",      // Text on the "first" button, ignored if firstIcon is not null
      lastText:    ">|",      // Text on the "last" button, ignored if lastIcon is not null
      gotoIcon:    null,      // Icon on the "go" button instead of gotoText
      prevIcon:    null,      // Icon on the "previous" button instead of prevText
      nextIcon:    null,      // Icon on the "next" button instead of nextText
      firstIcon:   null,      // Icon on the "first" button instead of firstText
      lastIcon:    null,      // Icon on the "last" button instead of lastText
      hideGoto:    false,     // Whether to hide the "goto page" button/input field
      hidePrev:    false,     // Whether to hide the "previous" button
      hideNext:    false,     // Whether to hide the "next" button
      hideFirst:   true,      // Whether to hide the "first" button. Should be "true" if splitLeft == 1
      hideLast:    true,      // Whether to hide the "last" button. Should be "true" if splitRight == 1
      splitLeft:   3,         // Number of split buttons to the left
      splitMiddle: 3,         // Number of split buttons in the middle
      splitRight:  3,         // Number of split buttons to the right
    }, opt);
    return this;
  }; // setOptions

  //
  // Redraw all the page numbers, ellipsis and navigators
  //
  this.refresh = function(opt)
  {
    if (!opt)
      opt = this.options;
    let np = this.numPages;
    this.initialize(opt);
    for (let page_no=1; page_no<=np; page_no++)
      this.addPage();
    this.showPage(1);
  }; // refresh

  //
  // Add a page number button
  //
  this.addPage = function()
  {
    if (!this.pager || !this.options)
      return this;

    ++this.numPages;

    // Show the new page button
    this.showPage(this.numPages,true);

    // Highlight the current page button
    toggleHighlight(this,this.currentPage,true);

    return this;
  } // addPage

  //
  // Remove a page number button
  //
  this.removePage = function()
  {
    if (!this.pager || !this.options)
      return this;

    removePageNumberButton(this,this.numPages);

    --this.numPages;
    if (this.currentPage > this.numPages)
      this.currentPage = this.numPages;

    this.refresh();
  }; // removePage

  //
  // Redraw the paginator with focus on the page pageNo
  //
  this.showPage = function(pageNo,skipHilite)
  {
    if (this.options.mode) {
      if (this.options.mode == 1)
        redrawItemRange(this,pageNo); // Create item range
      else
      if (this.options.mode == 2)
        redrawPageView(this,pageNo); // Create page number
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
        for (let i=1; i<=this.numPages; i++)
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
      if (!skipHilite)
        toggleHighlight(this,pageNo,true);
    } // else

    // Change prev and next buttons if neccessary
    redrawPrevButton(this,1);
    redrawNextButton(this,this.numPages);

    // Display goto page/input field
    if (!this.options.hideGoto)
      showGoto(this,pageNo);

    return this;
  }; // showPage

  //
  // Update the view when a button is clicked
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
  // Update the view when the go button is clicked or enter is prerss in the input field
  //
  this.goClicked = function(event)
  {
    let opt = event.data;
    if (!opt)
      return this;
    // Remove highlight from old button
    toggleHighlight(this,this.currentPage,false);
    // Find new page
    let num = $("#anyPaginator_goto_inp").val();
    if (Number.isInteger(parseInt(num))) {
      if (this.options.mode == 1) {
        let num_items = this.numPages * this.options.rowsPerPage;
        if (num >= 1 && num <= num_items)
          this.currentPage = Math.trunc((num-1)/this.options.rowsPerPage) + 1;
      }
      else { // mode == 0 or mode == 2
        if (num >= 1 && num <= this.numPages) {
          this.currentPage = num;
          opt.clickedPage = parseInt(this.currentPage);
        }
      }
      // Show new page
      this.showPage(this.currentPage);
      if (opt.onClick) {
        // Call user supplied function
        let context = opt.context ? opt.context : this;
        opt.onClick.call(context,event.data);
      }
    }
  }; // goClicked

  /////////////////////
  // Private methods //
  /////////////////////

  function redrawPaginatorContainer(self)
  {
    let pager_id = "anyPaginator_container";
    self.pager = $("#"+pager_id);
    if (self.pager.length)
      self.pager.remove();
    self.pager = $("<div id='"+pager_id+"' class='any-paginator-container'></div>");
    self.append(self.pager);
    return self.pager;
  }; // redrawPaginatorContainer

  function redrawPrevButton(self,first_page)
  {
    if (!self.pager || !self.options || first_page != 1)
      return self;
    let btn_id = "anyPaginator_prev";
    if ($("#"+btn_id))
      $("#"+btn_id).remove();
    let prev_class = self.currentPage == 1 ? "any-paginator-inactive" : "";
    let prev_text = "";
    if (!self.options.prevIcon)
      prev_text = self.options.prevText;
    else
      prev_class += " "+self.options.prevIcon;
    let prev_div   = $("<div id='"+btn_id+"' class='any-paginator-btn "+prev_class+" noselect'>"+prev_text+"</div>");
    self.pager.prepend(prev_div);
    if (self.currentPage > 1) {
      // The prev button should be active
      let click_opt = {...self.options};
      click_opt.clickedPage = "prev";
      prev_div.off("click").on("click", click_opt, $.proxy(self.buttonClicked,self));
    }
    else {
      // The prev button should be inactive
      prev_div.off("click");
      prev_div.css("cursor","default");
    }
    if (self.options.hidePrev)
      prev_div.hide();
    return self;
  }; // redrawPrevButton

  function redrawNextButton(self,last_page)
  {
    if (!self.pager || !self.options)
      return self;
    let btn_id = "anyPaginator_next";
    if ($("#"+btn_id))
      $("#"+btn_id).remove();
    let next_class = self.currentPage >= last_page ? "any-paginator-inactive" : "";
    let next_text = "";
    if (!self.options.nextIcon)
      next_text = self.options.nextText;
    else
      next_class += " "+self.options.nextIcon;
    let next_div   = $("<div id='"+btn_id+"' class='any-paginator-btn "+next_class+" noselect'>"+next_text+"</div>");
    self.pager.append(next_div);
    if (self.currentPage < last_page) {
      // The next button should be active
      let click_opt = {...self.options};
      click_opt.clickedPage = "next";
      next_div.off("click").on("click", click_opt, $.proxy(self.buttonClicked,self));
    }
    else {
      // The next button should be inactive
      next_div.off("click");
      next_div.css("cursor","default");
    }
    if (self.options.hideNext)
      next_div.hide();
    return self;
  }; // redrawNextButton

  function redrawPageNumberButton(self,pageNo,isEllipsis)
  {
    if (!self.pager || !self.options)
      return self;
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
    let ins = self.pager.find("#anyPaginator_"+(pageNo-1));
    if (ins.length)
      pg_div.insertAfter(ins);
    else {
      ins = self.pager.find("#anyPaginator_"+(pageNo+1));
      if (ins.length)
        pg_div.insertBefore(ins);
      else {
        // Search left side
        for (let i=pageNo-1; i>=1; i--) {
          ins = self.pager.find("#anyPaginator_"+i);
          if (ins.length)
            break;
        }
        if (ins.length) {
          pg_div.insertAfter(ins);
        }
        else {
          // Search right side
          for (let i=pageNo+1; i<self.numPages; i++) {
            ins = self.pager.find("#anyPaginator_"+i);
            if (ins.length)
              break;
          }
          if (ins.length) {
            pg_div.insertBefore(ins);
          }
        }
        if (!ins.length) {
          if (pageNo <= self.numPages)
            pg_div.insertAfter(self.pager.find("#anyPaginator_prev"));
          else
            pg_div.insertBefore(self.pager.find("#anyPaginator_next"));
        }
      } // else
    } // else
    if (!isEllipsis) {
      // Register click handler
      let click_opt = {...self.options};
      click_opt.clickedPage = parseInt(pageNo);
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

  function toggleHighlight(self,pageNo,toggle)
  {
    let pg_id  = "#anyPaginator_"+pageNo;
    let pg_div = self.pager.find(pg_id);
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

  function redrawItemRange(self,pageNo)
  {
    if (!self.pager || !self.options)
      return self;
    let div_id = "anyPaginator_itemrange";
    if ($("#"+div_id))
      $("#"+div_id).remove();
    let from = self.options.rowsPerPage * (pageNo-1) + 1;
    let to   = self.options.rowsPerPage * pageNo;
    let num  = self.options.rowsPerPage * self.numPages;
    let str = " "+from+"-"+to+" of "+num;
    let div = $("<div id='"+div_id+"' class='any-paginator-compact noselect'>"+str+"</div>");
    self.pager.append(div);
  } // redrawItemRange

  function redrawPageView(self,pageNo)
  {
    if (!self.pager || !self.options)
      return self;
    let div_id = "anyPaginator_pageview";
    if ($("#"+div_id))
      $("#"+div_id).remove();
    let str = " "+pageNo+"/"+self.numPages;
    let div = $("<div id='"+div_id+"' class='any-paginator-compact noselect'>"+str+"</div>");
    self.pager.append(div);
  } // pagenumber

  function showGoto(self,pageNo)
  {
    if (!self.pager || !self.options)
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
    self.pager.append(go_div);
    let click_opt = {...self.options};
    go_btn.off("click").on("click", click_opt, $.proxy(self.goClicked,self));
    go_inp.keypress(function (e) { if (e.which == 13) { self.goClicked({data:click_opt}); } });
  } // showGoto

  /////////////////////////////////////////
  // Call methods
  /////////////////////////////////////////

  if (!opt || typeof opt == "object")
    this.initialize(opt);
  else
  if (opt == "reset")
    this.reset();
  else
  if (opt == "options")
    this.setOptions(args);
  else
  if (opt == "refresh")
    this.refresh(args);
  else
  if (opt == "add")
    this.addPage();
  else
  if (opt == "remove")
    this.removePage();

  return this;
}; // anyPaginator

})( jQuery );
//@ sourceURL=anyPaginator.js