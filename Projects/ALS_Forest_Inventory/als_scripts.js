// Lightbox for the hero image (same as the other project pages)
function openModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "flex";
  document.getElementById("modalImage").src = document.getElementById("mapImage").src;
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

  // Interactive 3D view: load the iframe only after a click (the data are about 3.5 MB)
  const poster = document.getElementById('viewerPoster');
  if (poster) {
    poster.addEventListener('click', function() {
      const frame = document.createElement('iframe');
      frame.src = 'view3d.html';
      frame.className = 'map-frame';
      frame.title = 'Interactive 3D view of the ALS point cloud';
      poster.replaceWith(frame);
    });
  }

  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
  });
});
