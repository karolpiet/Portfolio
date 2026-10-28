// Lightbox dla zdjęcia hero
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

  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      document.querySelector('.navbar').classList.add('scrolled');
    } else {
      document.querySelector('.navbar').classList.remove('scrolled');
    }
  });
});
