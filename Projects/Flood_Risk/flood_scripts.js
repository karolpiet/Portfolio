// Funkcja otwierająca modal
function openModal() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const img = document.getElementById("mapImage");
  
  // Sprawdź czy obrazek istnieje
  if (!img.complete || img.naturalWidth === 0) {
    console.warn("Obrazek nie został załadowany, używam zastępczego");
    img.src = "https://maps.googleapis.com/maps/api/staticmap?center=Poland&zoom=6&size=800x600&maptype=roadmap";
  }

  modal.style.display = "flex";
  modalImg.src = img.src;
  
  // Dopasuj rozmiar po załadowaniu
  modalImg.onload = function() {
    const windowWidth = window.innerWidth * 0.9;
    const windowHeight = window.innerHeight * 0.9;
    const imgRatio = this.naturalWidth / this.naturalHeight;
    
    if (this.naturalWidth > windowWidth || this.naturalHeight > windowHeight) {
      if (windowWidth / imgRatio <= windowHeight) {
        this.style.width = `${windowWidth}px`;
        this.style.height = 'auto';
      } else {
        this.style.height = `${windowHeight}px`;
        this.style.width = 'auto';
      }
    } else {
      this.style.width = `${this.naturalWidth}px`;
      this.style.height = `${this.naturalHeight}px`;
    }
  };
}

// Funkcja zamykająca modal
function closeModal() {
  document.getElementById("imageModal").style.display = "none";
}

// Nasłuchiwanie klawisza ESC
document.addEventListener('keydown', function(e) {
  if (e.key === "Escape") closeModal();
});

// Inicjalizacja
document.addEventListener('DOMContentLoaded', function() {
  const img = document.getElementById("mapImage");
  img.addEventListener('click', openModal);
  
  // Przycisk powiększenia
  document.querySelector('.enlarge-icon').addEventListener('click', function(e) {
    e.stopPropagation();
    openModal();
  });
});