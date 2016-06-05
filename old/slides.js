'use strict';

$(function() {
  var slideNumber = 10000;
  function loadNextSlide() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readystate === 4 && this.status === 200) {
        var $slide = $('<img class="slide" />');
        var url = window.URL || window.webkitURL;
        $slide.attr('src', url.createObjectUrl(this.response))
          .zIndex(slideNumber--);

        $('#slideshow').append($slide);
        setTimeout(function() {
          $slide.slideLeft('slow', function() {
            $slide.remove();
          });
        }, 30000);
      }
    }
    xhr.open('GET', '/photos/next');
    xhr.responseType = 'blob';
    xhr.send();
  }

  // preload two slides
  loadNextSlide();
  loadNextSlide();
  setInterval(loadNextSlide, 30000);

  // request full screen
  var slideshow = $('#slideshow')[0];
  var fullscr = slideshow.requestFullScreen || slideshow.webkitRequestFullScreen ||
    slideshow.mozRequestFullScreen;
  fullscr();
});
