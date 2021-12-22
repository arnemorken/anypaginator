"use strict";
/****************************************************************************************
 *
 * anyPaginator is copyright (C) 2021 Arne D. Morken and Balanse Software.
 *
 * License: MIT.
 *
 ****************************************************************************************/

(function ( $ ) {

$.fn.anyPaginator = function (opt,args)
{
  ////////////////////
  // Public methods //
  ////////////////////

  // Sets the "this.pager", "this.numPages" and "this.currentPage" properties and creates prev/next buttons
  this.initialize = function(opt)
  {
    if (opt && typeof opt == "object")
      this.setOptions(opt);
    if (!this.options) {
      // plugin is not initialized
      console.error("anyPaginator plugin: Not initialized. ");
      return this;
    }
    if (this.options.rowsPerPage <= 0) {
      console.error("anyPaginator plugin: rowsPerPage <= 0. ");
      return this;
    }
    if (!this.currentPage)
      this.currentPage = 1;
    this.numPages = 0;
    this.pager    = getOrCreatePaginatorContainer(this);
    createPrevButton(this,1);
    createNextButton(this,this.numPages);
    return this;
  }; // initialize

  // Set options for the plugin
  this.setOptions = function(opt)
  {
    if (typeof opt != "object")
      return this;
    this.options = $.extend({
      rowsPerPage: 20,
    }, opt);
    return this;
  }; // setOptions

  // Update the buttons when one is clicked
  this.buttonClicked = function(event)
  {
    let opt = event.data;
    if (!opt)
      return this;
    if (opt.clickedPage) {
      // Remove highlight from old button
      let pagenum_id  = "#anyPaginator_"+this.currentPage;
      let pagenum_div = this.pager.find(pagenum_id);
      if (pagenum_div.length) {
        pagenum_div.css("border","1px solid #fc5200");
        pagenum_div.css("font-weight", "normal");
      }
      // Find and highlight new button
      pagenum_id  = "#anyPaginator_"+opt.clickedPage;
      pagenum_div = this.pager.find(pagenum_id);
      if (pagenum_div.length) {
        switch (opt.clickedPage) {
          case "prev":
            if (this.currentPage > 1) {
              --this.currentPage;
              pagenum_id  = "#anyPaginator_"+this.currentPage;
              pagenum_div = this.pager.find(pagenum_id);
              if (pagenum_div.length) {
                pagenum_div.css("border","2px solid #fc5200");
                pagenum_div.css("font-weight", "bolder");
              }
            }
            break;
          case "next":
            if (this.currentPage < this.numPages) {
              ++this.currentPage;
              pagenum_id  = "#anyPaginator_"+this.currentPage;
              pagenum_div = this.pager.find(pagenum_id);
              if (pagenum_div.length) {
                pagenum_div.css("border","2px solid #fc5200");
                pagenum_div.css("font-weight", "bolder");
              }
            }
            break;
          default:
            if (Number.isInteger(opt.clickedPage)) {
              this.currentPage = opt.clickedPage;
              pagenum_div.css("border","2px solid #fc5200");
              pagenum_div.css("font-weight", "bolder");
            }
            break;
        }
        createPrevButton(this,1);
        createNextButton(this,this.numPages);
      }
    }
    if (opt.onClick) {
      let context = opt.context ? opt.context : this;
      opt.onClick.call(context,event.data);
      let that = this;
    }
  }; // buttonClicked

  /////////////////////
  // Private methods //
  /////////////////////

  function getOrCreatePaginatorContainer(self)
  {
    let pager_id = "anyPaginator_container";
    self.pager = $("#"+pager_id);
    if (!self.pager.length) {
      self.pager = $("<div id='"+pager_id+"' class='any-paginator-container'></div>");
      self.append(self.pager);
    }
    return self.pager;
  }; // getOrCreatePaginatorContainer

  function createPrevButton(self,first_page)
  {
    if (!self.pager || !self.options || first_page != 1)
      return self;
    if ($("#anyPaginator_prev"))
      $("#anyPaginator_prev").remove();
    let prev_class = self.currentPage == 1 ? "any-paginator-inactive" : "";
    let prev_div   = $("<div id='anyPaginator_prev' class='any-paginator-num "+prev_class+" noselect'><<"+"</div>");
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
    return self;
  }; // createPrevButton

  function createNextButton(self,last_page)
  {
    if (!self.pager || !self.options)
      return self;
    if ($("#anyPaginator_next"))
      $("#anyPaginator_next").remove();
    let next_class = self.currentPage >= last_page ? "any-paginator-inactive" : "";
    let next_div   = $("<div id='anyPaginator_next' class='any-paginator-num "+next_class+" noselect'>"+">>"+"</div>");
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
    return self;
  }; // createNextButton

  function createPageNumberButton(self,pageNo)
  {
    if (!self.pager || !self.options)
      return self;

    if (pageNo <= self.numPages)
      return;

    // Create page number button
    let pagenum_div = $("<div id='anyPaginator_"+pageNo+"' class='any-paginator-num any-paginator-num-page noselect'>"+pageNo+"</div>");
    pagenum_div.insertBefore(self.pager.find("#anyPaginator_next"));

    ++self.numPages;

    // Register click handler
    let click_opt = {...self.options};
    click_opt.clickedPage = pageNo;
    pagenum_div.off("click").on("click", click_opt, $.proxy(self.buttonClicked,self));

    // Make the current page number stand out
    if (self.currentPage == pageNo) {
      pagenum_div.css("border","2px solid #fc5200");
      pagenum_div.css("font-weight", "bolder");
    }
    // Change prev and next buttons if neccessary
    createPrevButton(self,1);
    createNextButton(self,pageNo);

    return self;
  }; // createPageNumberButton

  //
  // Call methods
  //
  if (typeof opt == "object")
    this.initialize(opt);
  else
  if (opt == "options")
    this.setOptions(opt);
  else
  if (opt == "page")
    createPageNumberButton(this,args);

  return this;
}; // anyPaginator

})( jQuery );
//@ sourceURL=anyPaginator.js
