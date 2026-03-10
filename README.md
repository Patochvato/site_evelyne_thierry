# Site Evelyne & Thierry

Site vitrine one-page pour la location d'un bungalow a Saint-Leu (La Reunion).

## Contenu

- Section hero + presentation
- Galerie photos (diaporama auto)
- Tarifs et services
- Carte Google Maps
- Agenda de disponibilites (sync iCal Airbnb)
- Formulaire de contact (FormSubmit) + bouton WhatsApp

## Arborescence

- index.html
- css/style.css
- css/responsive.css
- js/main.js
- Photos/
- scripts/update-gallery-images.ps1

## Lancer en local

Depuis le dossier du projet:

```powershell
py -m http.server 5500
```

Puis ouvrir:

- http://localhost:5500

## Mettre a jour la galerie

Le script met a jour automatiquement la liste des images dans le diaporama:

```powershell
.\scripts\update-gallery-images.ps1
```

## Configuration agenda iCal

Dans la section disponibilites de index.html, renseigner l'attribut:

- data-ical-url="https://www.airbnb.fr/calendar/ical/..."

## Formulaire de contact

Le formulaire envoie les messages via FormSubmit vers:

- thierry.boisselier974@gmail.com

Pensez a valider l'activation FormSubmit lors du premier envoi.

## Publication

Projet publie via GitHub Pages (branche du depot).
