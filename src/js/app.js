/* sweetScroll load */
document.addEventListener("DOMContentLoaded", function () {
  new SweetScroll({/* some options */});

  /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
  particlesJS("particles-js", {
    particles: {
      number: {
        value: 85,
        density: { enable: true, value_area: 800 }
      },
      color: {
        value: "#000000"
      },
      shape: {
        type: "circle",
        stroke: { width: 0, color: "#000000" }
      },
      opacity: {
        value: 0.65,
        random: true,
        anim: { enable: true, speed: 1, opacity_min: 0.7, sync: false }
      },
      size: {
        value: 7.5,
        random: true,
        anim: { enable: true, speed: 2, size_min: 2, sync: false }
      },
      line_linked: {
        enable: true,
        distance: 190,
        color: "#000000",
        opacity: 0.3,
        width: 1
      },
      move: {
        enable: true,
        speed: 0.65,
        direction: "right",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: { enable: false, rotateX: 600, rotateY: 1200 }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "grab"
        },
        onclick: { enable: true, mode: "push" },
        resize: true
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: {
            opacity: 1
          }
        },
        push: { particles_nb: 1 },
        remove: { particles_nb: 0 }
      }
    },
    retina_detect: true
  });

  window.addEventListener("load", function () {
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS && window.pJSDom[0].pJS.particles) {
      var particles = window.pJSDom[0].pJS.particles.array;
      particles.forEach(function (p) {
        p.initialColor = p.color.value;
        p.initialSize = p.radius;
      });
    }
  });

}, false);
