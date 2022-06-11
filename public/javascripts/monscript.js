
// DEROULE LES EXP ET LES FORMATIONS
// afficher les détails des experiences et des formations
function showDetail(e) {
    // contenu details
    let et = e.currentTarget.querySelector('ul');
    et.hidden = !et.hidden;
    // durée
    let dur = e.currentTarget.querySelector('span.duree');
    if (dur) {dur.hidden = !dur.hidden};
    // pour la version mobile, toggle d’autres détails
    let spans = e.currentTarget.querySelectorAll('span');
    spans.forEach(s => {
        if (!s.style.display) {s.style.display = "inline"} 
        else {s.style.display = '';}
    });
}
// création des boutons interactifs sur les étiquettes
let etis = document.querySelectorAll('.etiquette');
etis.forEach(e => e.addEventListener('click', showDetail));

// DEROULE LES CONTACTS
// Création d’un onglet cliquable pour déployer les détails de contacts
document.querySelector('.contact').addEventListener('click', (e) => {
    if (!e.currentTarget.hasAttribute("deploy")) {
        e.currentTarget.setAttribute("deploy", "");
        e.currentTarget.style.width = '220px';
    }
    else {
        e.currentTarget.style.width = ''; // Supprime l’inline css 'width' pour revenir au comportement initial de l’élément 
        e.currentTarget.removeAttribute("deploy");
    }
})

// VERSION MOBILE
// réaffiche les elements masqués par la mediaquery
function showSection(e) {
    let maskedItems = e.currentTarget.parentNode.querySelectorAll('section.mainblock > div, section.compblock > div');
    maskedItems.forEach(m => {
        if (!m.style.display && m.parentNode.className == "mainblock" ) {m.style.display = 'flex'}
        else if (!m.style.display) {m.style.display = 'block'}
        else {m.style.display = ''};
    })
}
// création des boutons de la version mobile
let boumob = document.querySelectorAll('section h2:not(.profession)');
boumob.forEach(b => b.addEventListener('click', showSection));