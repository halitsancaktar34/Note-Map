import {
    userIcon,
    setStorage,
    getStorage,
    translate,
    icons,
} from './helpers.js';

const form = document.querySelector('form');
const input = document.querySelector('form #title');
const cancelBtn = document.querySelector('form #cancel');
const noteList = document.querySelector('ul');
const expandBtn = document.querySelector('#checkbox');
const aside = document.querySelector('.wrapper');

var map;
var coords = [];
var notes = getStorage('NOTES') || [];
var markerLayer = [];

cancelBtn.addEventListener('click', () => {
    form.style.display = 'none';
    clearForm();
});

function loadMap(coords) {

    map = L.map('map').setView(coords, 10);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markerLayer = L.layerGroup().addTo(map);

    L.marker(coords, { icon: userIcon })
        .addTo(map)
        .bindPopup('Bulunduğunuz Konum');

    renderNoteList(notes);

    map.on('click', onMapClick);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = e.target[0].value;
    const date = e.target[1].value;
    const status = e.target[2].value;

    notes.unshift({
        id: new Date().getTime(),
        title,
        date,
        status,
        coords,
    });

    renderNoteList(notes);

    setStorage(notes);

    form.style.display = 'none';
    clearForm();
});

function renderMarker(item) {

    L.marker(item.coords, { icon: icons[item.status] })

        .addTo(markerLayer)

        .bindPopup(item.title);
}

function renderNoteList(items) {

    noteList.innerHTML = '';

    markerLayer.clearLayers();

    items.forEach((ele) => {

        const listEle = document.createElement('li');

        listEle.dataset.id = ele.id;

        listEle.innerHTML = `
              <div>
                <p>${ele.title}</p>
                <p><span>Tarih:</span> ${ele.date}</p>
                <p><span>Durum:</span> ${translate[ele.status]}</p>
              </div>
              <i id="fly" class="bi bi-airplane-fill"></i>
              <i id="delete" class="bi bi-trash3-fill"></i>
      `;
        noteList.appendChild(listEle);

        renderMarker(ele);
    });
}

navigator.geolocation.getCurrentPosition(

    (e) => loadMap([e.coords.latitude, e.coords.longitude]),

    () => {
        loadMap([38.802424, 35.505317]);
    }
);

const onMapClick = (e) => {

    coords = [e.latlng.lat, e.latlng.lng];

    form.style.display = 'flex';

    input.focus();
};

function clearForm() {
    form[0].value = '';
    form[1].value = '';
    form[2].value = 'goto';
}

noteList.addEventListener('click', (e) => {
    const found_id = e.target.closest('li').dataset.id;

    if (
        e.target.id === 'delete' &&
        confirm('Silmek istediğinizden emin misiniz?')
    ) {
        notes = notes.filter((note) => note.id !== Number(found_id));

        setStorage(notes);

        renderNoteList(notes);
    }

    if (e.target.id === 'fly') {

        const note = notes.find((note) => note.id === Number(found_id));

        map.flyTo(note.coords, 15);

        var popup = L.popup()
            .setLatLng(note.coords)
            .setContent(note.title);

        if (window.innerWidth < 769) {
            checkbox.checked = false;
            aside.classList.add('hide');
        }
        popup.openOn(map);
    }
});

checkbox.addEventListener('input', (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
        aside.classList.remove('hide');
    } else {
        aside.classList.add('hide');
    }
});