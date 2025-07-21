document.addEventListener('DOMContentLoaded', function() {
  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
});

// Image modal functions
function openModal() {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const img = document.getElementById('mapImage');
  
  modal.style.display = "block";
  modalImg.src = img.src;
}

function closeModal() {
  document.getElementById('imageModal').style.display = "none";
}

// Gallery modal functions
function openGalleryModal(element) {
  const modal = document.getElementById('galleryModal');
  const modalImg = document.getElementById('galleryModalImage');
  const captionText = document.getElementById('modalCaption');
  
  modal.style.display = "block";
  modalImg.src = element.src;
  captionText.innerHTML = element.alt;
}

function closeGalleryModal() {
  document.getElementById('galleryModal').style.display = "none";
}