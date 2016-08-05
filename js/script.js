(function ($, root, undefined) {$(function () {'use strict'; // on ready start
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////
//         General Functions
///////////////////////////////////////

  // converts a utf8 string (with no spaces) to into normal text
  // use this to convert text - https://r12a.github.io/apps/conversion/
  function stringConverter(utf8) {
    var utf8Escaped = '';
    for ( var i=0; i< utf8.length; i=i+2 ){
      utf8Escaped = utf8Escaped + '%' + utf8.substr(i,2);
    };
    var convertedutf8 = unescape(utf8Escaped);
    return convertedutf8
  }

  // gets cookies & checks for name
  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1);
      if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
  }

  // finds image with class and swaps .png with .svg in img source string
  function svgSwapper() {
    if (Modernizr.svgasimg) {
      var svgSwap = $('img.js-svg-swap');
      svgSwap.each( function() {
        var currentSrc = $(this).attr('src'),
            newSrc = currentSrc.replace('.png', '.svg');
        $(this).attr('src', newSrc);
      });
    }
  }
  // runs on password screen, will run again when content is loaded
  svgSwapper();

  // detects touch device
  if ( "ontouchstart" in document.documentElement ) {
    $('html').addClass('touch').removeClass('no-touch');
  }


///////////////////////////////////////
//        General Variables
///////////////////////////////////////

  var documentWindow          = $( window ),
      password                = stringConverter('61'),
      passwordEntry           = $('.js-password-entry'),
      passwordForm            = $('.js-password-form'),
      passwordSection         = $('.js-password'),
      passwordMessage         = $('.js-password-message'),
      contentTarget           = $('.js-content-target'),
      content                 = stringConverter('7971767865713252754B62756F575664616E6679326A5941597143742E68746D6C'),
      passwordCookieName      = 'se-campaign-report-password',
      passwordCookie          = getCookie(passwordCookieName),
      keyboardPromptClass     = 'keyboard-prompt',
      keyboardPromptElement   = '<div class="'+ keyboardPromptClass + '__wrap"><div class=" ' + keyboardPromptClass + '"><p>Use arrow keys to move between slides</p></div></div>',
      keyboardCookieName      = 'se-campaign-report-keyboard-prompt',
      keyboardCookie          = getCookie(keyboardCookieName),
      currentCookies          = document.cookie;

      // should go through scrip to make sure all the important variables are here
      // should probably change both cookies so they dont expire for ages that way, people aren't annoyed when the prompt comes up a lot



  ///////////////////////////////////////
  //    Script for loaded content
  ///////////////////////////////////////

  // code to run when page content has loaded
  function contentJs() {

    // load in svgs if supported
    svgSwapper();

    // set variables for navigation build
    var sectionLinks    = [],
        fullpageNav     = $('.js-fullpage-menu');

    // Loops through each section to build nav & fullpage init
    $('.section').each( function() {
      // gets title, link & nav item
      var sectionLink     = $(this).data('section-link'),
          sectionTitle    = $(this).data('section-title'),
          fullpageNavItem = '<li class="fullpage-menu__item" data-menuanchor="' + sectionLink + '"><a class="fullpage-menu__link" href="#' + sectionLink + '">' + sectionTitle + '</a></li>';
      // adds section link to array for fullpage init
      sectionLinks.push( sectionLink );
      // builds navigation item
      fullpageNav.append( fullpageNavItem );
    });

    // fullpage.js framework init with options
    $('.fullpage').fullpage({
      scrollingSpeed: 500,
      anchors: sectionLinks,
      menu: '.fullpage-menu',
      slidesNavigation: true,
      slidesNavPosition: 'bottom',
      autoScroll: false,
      responsiveWidth: 760,
      responsiveHeight: 500
    });

    // prevents scrolling sections, can only use keyboard to navigate
    $.fn.fullpage.setAllowScrolling(false);

    // adds pdf link to download button
    var downloadBtn = $('.js-pdf-download'),
        pdfFileName = downloadBtn.data('pdf-name'),
        pdfFilePath = "/pdf/" + pdfFileName;

    downloadBtn.attr('href', pdfFilePath);

    // menu open toggle
    $('.js-menu-toggle, .fullpage-menu__link').on('click', function() {
      $('.menu').toggleClass('menu--open');
    });

    // Creates the keyboard navigation prompt
    function keyboardPrompt() {
      // If message hasn't displayed, run the function
      if ( !(keyboardCookie) ) {
        // creates keyboard prompt element
        contentTarget.prepend(keyboardPromptElement)
        // init key press event handler to remove element
        documentWindow.on('keydown', keyboardPromptRemove);
      };
    }

    // Removes keyboard navigation prompt
    function keyboardPromptRemove(e) {
      if ( // if the prompt is on screen and any direction key is pressed
           ( $('.' + keyboardPromptClass).length > 0 ) && ( e.keyCode > 36 && e.keyCode < 41 )
         ){
        // remove prompt element
        $('.' + keyboardPromptClass).slideUp();
        // remove event handler
        documentWindow.off('keydown', keyboardPromptRemove);
        // creates cookie so keyboard prompt isn't repeatedly shown
        document.cookie = keyboardCookieName + "=1";
      };
    };

    // init keyboard prompt function
    keyboardPrompt();

    // show unsupported content
    if ( Modernizr.unsupports ) {
        console.log('no site mate');
    }

  }


  ///////////////////////////////////////
  //    Load content function
  ///////////////////////////////////////


  // loads the presentation content & creates event handlers
  function loadContent() {

    contentTarget.load(content, function() {

      // could use .ready here so that there is no fouc when screen is lifted??
      // not essential, but will need to look into if I want nice loading states

      // removes loading state
      $('body').removeClass('body--loading');

      // removes the password form and loads in page content
      passwordSection.addClass('password--remove');

      // removes the password form after css transition is completed
      setTimeout(function(){
        passwordSection.remove();
      }, 1000);

      // runs js needed for page content
      contentJs();

    });
  }


  ///////////////////////////////////////
  //         Password function
  ///////////////////////////////////////

  // checks for successful password cookie
  if (passwordCookie) {
    loadContent();
  } else {
    // removes loading state
    $('body').removeClass('body--loading');
    // shows password form
    passwordSection.removeClass('hidden');
  }

  // loads page content if correct password
  passwordForm.submit( function(e) {
    e.preventDefault();
    // checks password
    if ( passwordEntry.val() === password ) {
      // creates cookie so password isn't required on refresh
      document.cookie = passwordCookieName + "=1";
      // adds loading state to password form & loads content
      passwordSection.addClass('password--loading');
      loadContent();
    } else {
      // resets submit form and adds a retry message
      passwordEntry.val('').focus();
      passwordMessage.addClass('password__message--show');
      passwordEntry.addClass('password-form__input--highlight');
    }
  });






///////////////////////////////////////////////////////////////////////////////
});})(jQuery, this); // on ready end