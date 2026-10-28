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

document.addEventListener('DOMContentLoaded', function() {
  const img = document.getElementById('mapImage');
  if (img) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', openModal);
  }
});

function closeModal() {
  document.getElementById('imageModal').style.display = "none";
}

// Close the modal with ESC or by clicking the dark background
document.addEventListener('keydown', function(e) {
  if (e.key === "Escape") closeModal();
});
document.addEventListener('click', function(e) {
  if (e.target.id === 'imageModal') closeModal();
});
