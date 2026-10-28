// Lightbox dla zdjęcia hero (wspólne z projektem Forest Fire)
function openModal() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const img = document.getElementById("mapImage");

  modal.style.display = "flex";
  modalImg.src = img.src;
}

function closeModal() {
  document.getElementById("imageModal").style.display = "none";
}

document.addEventListener('keydown', function(e) {
  if (e.key === "Escape") closeModal();
});

document.addEventListener('DOMContentLoaded', function() {
  const img = document.getElementById("mapImage");
  if (img) img.addEventListener('click', openModal);

  const enlargeIcon = document.querySelector('.enlarge-icon');
  if (enlargeIcon) {
    enlargeIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      openModal();
    });
  }

  // Interactive 3D view: load the iframe only after a click (the file is about 4 MB)
  const poster = document.getElementById('viewerPoster');
  if (poster) {
    poster.addEventListener('click', function() {
      const frame = document.createElement('iframe');
      frame.src = 'view3d.html';
      frame.className = 'map-frame';
      frame.title = 'Interactive 3D view of a real forest plot';
      poster.replaceWith(frame);
    });
  }

  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      document.querySelector('.navbar').classList.add('scrolled');
    } else {
      document.querySelector('.navbar').classList.remove('scrolled');
    }
  });
});
