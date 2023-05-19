var prevScrollpos = window.pageYOffset;

window.onscroll = function() {
    var currentScrollPos = window.pageYOffset;
    var navbar = document.querySelector("#navbar");
    var header = document.querySelector("#header");

    if (prevScrollpos > currentScrollPos) {
      navbar.style.top = "0";
      header.style.top = `${navbar.offsetHeight}px`

    } else {
      navbar.style.top = `-${navbar.offsetHeight}px`;
      header.style.top = "0";
    }
    prevScrollpos = currentScrollPos;
  }