
const themeBtn = document.getElementById('theme-btn');
const body = document.body;

// Verifica se o usuário já tinha uma preferência salva
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeBtn.textContent = "☀️";
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeBtn.textContent = "☀️";
    } else {
        localStorage.setItem('theme', 'light');
        themeBtn.textContent = "🌙";
    }
});

