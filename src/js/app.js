// const testModules = require('./test-module');
import Chart from 'chart.js/auto';

const L = require('leaflet');
const _ = require('lodash');
const dayjs = require('dayjs');

require('../css/app.css');

const {
  format,
  formatAdd,
} = require('./functions');

const canvas = document.getElementById('country-chart');
const ctx = canvas.getContext('2d');
const canvas2 = document.getElementById('age-chart');
const ctx2 = canvas2.getContext('2d');

Chart.defaultFontColor = 'black';
Chart.defaultFontSize = 16;

const countryChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['1', '2'],
    datasets: [
      {
        fill: true,
        backgroundColor: ['#000', '#fff'],
        data: ['1', '2'],
      },
    ],
  },
});

const ageChart = new Chart(ctx2, {
  type: 'pie',
  data: {
    labels: ['1', '2'],
    datasets: [
      {
        fill: true,
        backgroundColor: ['#000', '#fff'],
        data: ['1', '2'],
      },
    ],
  },
});

function setPieChart(chart, array, prop) {
  const statsPieChart = chart;
  const stats = {};
  array.forEach((obj) => {
    if (!obj[prop]) {
      if (stats['No data']) stats['No data'] += 1; else stats['No data'] = 1;
    } else if (prop !== 'age') {
      if (stats[obj[prop]]) stats[obj[prop]] += 1;
      else stats[obj[prop]] = 1;
    } else {
      const age = `${(obj.age - (obj.age % 10))}+`;
      if (stats[age]) stats[age] += 1;
      else stats[age] = 1;
    }
  });

  statsPieChart.data.labels = (Object.keys(stats));
  statsPieChart.data.datasets[0].backgroundColor = [
    '#FF3855', '#4570E6',
    '#FDFF00', '#299617',
    '#9C51B6', '#FA5B3D',
    '#87FF2A', '#0066FF',
    '#2243B6', '#E936A7',
    '#02A4D3', '#FF7A00',
    '#5946B2', '#5DADEC',
    '#A83731', '#45A27D',
    '#4F69C6', '#FF355E',
    '#FF5470', '#FFDB00',
    '#FFAA1D', '#FF007C',
  ];
  statsPieChart.data.datasets[0].data = Object.values(stats);
  statsPieChart.update();
}

function queryString(params) {
  let string = '';

  Object.keys(params)
    .forEach((key) => {
      if (params[key]) {
        string += `&${key}=${params[key]}`;
      }
    });

  return string;
}

let arr;

function getTeachers(results, params) {
  const xhr = new XMLHttpRequest();
  const url = `https://randomuser.me/api?seed=webdev&results=${results}${queryString(params)}`;
  xhr.open('GET', url, false);
  // console.log(url);
  xhr.send(null);
  if (results === 50) {
    arr = _.map(JSON.parse(xhr.responseText)
      .results, (el) => formatAdd(format(el)));
  }
  return _.map(JSON.parse(xhr.responseText)
    .results, (el) => formatAdd(format(el)));
}

// const teachers = formatObjects(randomUserMock, additionalUsers);
const teachers = getTeachers(50, {});
arr = [...teachers];
const countries = new Set();
const countryCodes = {
  Australia: 'au',
  Brazil: 'br',
  Canada: 'ca',
  Switzerland: 'ch',
  Germany: 'de',
  Denmark: 'dk',
  Spain: 'es',
  Finland: 'fi',
  France: 'fr',
  'United Kingdom': 'gb',
  Ireland: 'ie',
  Iran: 'ir',
  Norway: 'no',
  Netherlands: 'nl',
  'New Zealand': 'nz',
  Turkey: 'tr',
  'United States': 'us',
};
const countrySelect = document.getElementById('country');
let optHTML = '';
// eslint-disable-next-line no-restricted-syntax,guard-for-in
for (const key in countryCodes) {
  optHTML += `<option>${key}</option>`;
}
countrySelect.innerHTML = optHTML;

setPieChart(countryChart, arr, 'country');
setPieChart(ageChart, arr, 'age');

document.getElementById('req-country-select').innerHTML = optHTML;

function showInfo(el) {
  let id = el.getAttribute('id');
  el.addEventListener('click', () => {
    if (id.substring(0, 3) === 'fav') {
      id = id.substring(3);
    }
    // const teacher = findObject(arr, 'id', id);
    const teacher = _.find(arr, (obj) => obj.id === id);
    // console.log(teacher);
    document.getElementById('teacher-photo').innerHTML = `<img id="photo-info" 
        src="${teacher.picture_large ? teacher.picture_large : 'images/image.jpg'}" alt="Teacher photo"/>`;

    let daysLeft;
    if (teacher.b_date) {
      let dayjsInst = dayjs(teacher.b_date);
      dayjsInst = dayjsInst.year(dayjs().year());
      if (dayjsInst.diff(dayjs(), 'day') < 0) dayjsInst = dayjsInst.year(dayjs().year() + 1);
      daysLeft = dayjsInst.diff(dayjs(), 'day');
    }
    document.getElementById('info').innerHTML = `<div id="teacher-name"><h2 id="name-info">${teacher.full_name}</h2>
        <span class="star" id="star" data-fav="${teacher.favorite}" style="color: ${teacher.favorite ? '#eedd00' : '#ffffff'}">&#9733;</span></div>
        <p><span id="city-info">${teacher.city}</span>, <span id="country-info">${teacher.country}</span></p>
        <p><span id="age-info">${teacher.age ? teacher.age : 'age'}</span>, <span id="sex-info">${teacher.gender}</span></p>
        <p>Now: ${dayjs().format('DD.MM.YYYY')}</p>${teacher.b_date ? `<p>Birth date: ${dayjs(teacher.b_date).format('DD.MM.YYYY')}</p>
        <p>Days left until next birthday: ${daysLeft}</p>` : ''}
        <p><a id="email-info" href="mailto:${teacher.email}">${teacher.email ? teacher.email : 'email'}</a></p>
        <p id="phone-info">${teacher.phone ? teacher.phone : 'phone'}</p>`;
    document.getElementById('comment-note').innerText = teacher.note;

    const mapBtn = document.getElementById('map-btn');
    if (mapBtn) {
      const mapBtnNew = mapBtn.cloneNode(true);
      mapBtn.replaceWith(mapBtnNew);
    } else {
      document.getElementById('map-container').insertAdjacentHTML('afterbegin', '<button id="map-btn">toggle map</button>');
    }

    if (teacher.coordinates.latitude) {
      document.getElementById('map-btn')
        .addEventListener('click', () => {
          const mapInst = document.getElementById('map');
          if (mapInst) mapInst.remove();
          document.getElementById('map-inside')
            .innerHTML = '<div id="map"></div>';

          const map = L.map('map')
            .setView([teacher.coordinates.latitude, teacher.coordinates.longitude], 5);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1Ijoiam9yZ2VzYW5jaGV6NDE4MyIsImEiOiJja3dpNW54MTQxNTd3Mm9wbXJ4eGM5MXF6In0.QfxusUycYfyzYvbM5xYA9w',
          })
            .addTo(map);

          L.marker([teacher.coordinates.latitude, teacher.coordinates.longitude])
            .addTo(map);

          document.getElementById('close-info')
            .addEventListener('click', () => {
              if (map) {
                document.getElementById('map-inside').innerHTML = '';
              }
            });
        });
    } else {
      document.getElementById('map-btn').remove();
    }

    //
    //
    document.getElementById('star')
      .addEventListener('click', () => {
        const star = document.getElementById('star');
        const el1 = document.getElementById(id);
        let li;
        if (el1) li = el1.parentElement;
        if (star.getAttribute('data-fav') === 'true') {
          star.setAttribute('data-fav', 'false');
          star.style.color = '#ffffff';
          teacher.favorite = false;
          if (el1) {
            li.removeChild(el1.previousElementSibling);
          }
        } else {
          star.setAttribute('data-fav', 'true');
          star.style.color = '#eedd00';
          teacher.favorite = true;
          li.insertAdjacentHTML('afterbegin', teacher.favorite ? '<div class="list-star">&#9733;</div>' : '');
        }
        // eslint-disable-next-line no-use-before-define
        setFavTeachers(arr);
      });
    //
  });
}

// SHOW INFO POPUP
function infoListeners(fav) {
  document.querySelectorAll('.icon')
    .forEach((el) => {
      if (fav) {
        if (el.getAttribute('id')
          .substring(0, 3) === 'fav') {
          showInfo(el);
        }
      } else {
        showInfo(el);
      }
    });
}

// TEACHERS
function setTopTeachers(array) {
  const ulTop1 = document.getElementById('ulTop');
  let topHTML = '';
  array.forEach((el) => {
    let star = '';
    if (el.favorite) {
      star = '<div class="list-star">&#9733;</div>';
    }
    topHTML += `<li class="teacher">${star}<img src="${el.picture_large}" class="icon" id="${el.id}" alt="teacher" onclick="window.location.href = '#teacher-card'">`
      + `<p class="t-name">${el.full_name.split(' ')[0]}<br>${el.full_name.split(' ')[1]}</p>`
      + `<p class="t-country">${el.country}</p></li>`;
    countries.add(el.country);
  });
  ulTop1.innerHTML = topHTML;
  infoListeners(false);
}

function setFavTeachers(array) {
  const ulFav1 = document.getElementById('ulFav');
  let favHTML = '';
  array.forEach((el) => {
    if (el.favorite) {
      favHTML += `<li class="teacher"><img src="${el.picture_large}" class="icon" id="fav${el.id}" alt="teacher" onclick="window.location.href = '#teacher-card'">`
        + `<p class="t-name">${el.full_name.split(' ')[0]}<br>${el.full_name.split(' ')[1]}</p>`
        + `<p class="t-country">${el.country}</p></li>`;
    }
  });
  ulFav1.innerHTML = favHTML;
  infoListeners(true);
}

let filtered = false;

// TABLE
function setTable(array) {
  const tableBody1 = document.getElementById('stats-body');
  if (array.length <= 10) {
    const pages = document.getElementById('pages');
    const stats = document.getElementById('statistics');
    if (parseInt(stats.getAttribute('data-filtered'), 10) <= 10) pages.innerHTML = '';
    let tableHTML1 = '';
    for (let i = 0; i < array.length; i += 1) {
      tableHTML1 += `<tr><td>${array[i].full_name}</td><td>${array[i].age}</td><td>${array[i].gender}</td><td>${array[i].country}</td><td>${dayjs(array[i].b_date).format('DD.MM.YYYY')}</td></tr>`;
    }
    tableBody1.innerHTML = tableHTML1;
  } else {
    const pages = document.getElementById('pages');
    pages.innerHTML = '';
    const pagesNum = Math.ceil(((array.length * 1.0) / 10));
    for (let i = 1; i < pagesNum + 1; i += 1) {
      const page = document.createElement('a');
      page.setAttribute('href', '#statistics');
      const pageId = i;
      page.innerText = `${pageId}`;
      page.setAttribute('id', `page${pageId}`);

      if (!filtered && array.length === 50) {
        page.addEventListener('click', () => {
          const pageArr = getTeachers(10, { page: `${pageId}` });
          setTable(pageArr);
          // eslint-disable-next-line no-use-before-define
          tableSort(pageArr);
        });
      } else {
        page.addEventListener('click', () => {
          const startIndex = (i - 1) * 10;
          let endIndex = i * 10;
          if (i === pagesNum) {
            endIndex -= pagesNum % 10;
          }
          const pageArr = array.slice(startIndex, endIndex);
          setTable(pageArr);
          // eslint-disable-next-line no-use-before-define
          tableSort(pageArr);
        });
      }
      pages.appendChild(page);
    }
    const pageArr = array.slice(0, 10);
    setTable(pageArr);
    // eslint-disable-next-line no-use-before-define
    tableSort(pageArr);
    const page1 = document.getElementById('page1');
    page1.setAttribute('href', '#0');
    page1.click();
    page1.setAttribute('href', '#statistics');
  }
}

function setAll(array) {
  setTopTeachers(array);
  setFavTeachers(array);
  setTable(array);
  setPieChart(countryChart, array, 'country');
  setPieChart(ageChart, array, 'age');
}

// TABLE SORTING
function sorter(array, el) {
  document.getElementById('stats-body').innerHTML = '';
  const prop = el.getAttribute('id')
    .replace('-header', '');
  let ascend;
  if (el.getAttribute('data-ascend') === 'true') {
    el.setAttribute('data-ascend', 'false');
    ascend = -1;
  } else {
    el.setAttribute('data-ascend', 'true');
    ascend = 1;
  }
  setTable(ascend === 1 ? _.sortBy([...array], [prop]) : _.sortBy([...array], [prop]).reverse());
}

function tableSort(array) {
  document.querySelectorAll('.theader')
    .forEach((el) => {
      const id = el.getAttribute('id');
      el.replaceWith(el.cloneNode(true));
      document.getElementById(id)
        .addEventListener('click', () => {
          sorter(array, el);
        });
    });
}

function setFiltered(array) {
  setTable(array, true);
  tableSort(array);
  setTopTeachers(array);
  setPieChart(countryChart, array, 'country');
  setPieChart(ageChart, array, 'age');
}

setAll(arr);
tableSort(arr);

function searchSelect() {
  document.getElementById('search-option')
    .addEventListener('change', () => {
      const myForm = document.getElementById('header-form');
      const data = new FormData(myForm);
      const option = data.get('search-option');
      const el = document.getElementById('name-search');
      if (option === 'age') {
        el.setAttribute('type', 'number');
      } else {
        el.setAttribute('type', 'text');
      }
    });
}

searchSelect();

function searchListener() {
  const form = document.getElementById('header-form');
  // form = form.cloneNode(true);
  // searchSelect();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const myForm = document.getElementById('header-form');
    const data = new FormData(myForm);
    const name = data.get('name-search')
      .toLowerCase();
    const option = data.get('search-option');
    let result;
    if (option === 'name') {
      result = arr.find((el) => el.full_name.toLowerCase() === name
        || el.full_name.split(' ')[0].toLowerCase() === name
        || el.full_name.split(' ')[1].toLowerCase() === name);
    } else if (option === 'age') {
      result = arr.find((el) => el.age === parseInt(name, 10));
    } else {
      result = arr.find((el) => (el.note ? el.note.toLowerCase()
        .includes(name.toLowerCase()) : false));
    }
    if (result) {
      const { id } = result;
      document.getElementById(id)
        .click();
    } else {
      alert('User not found!');
    }
    myForm.reset();
    document.getElementById('name-search')
      .setAttribute('type', 'text');
  });
}

searchListener();

const filterProps = {
  country: false,
  countryVal: null,
  age: false,
  ageVal: null,
  ageSign: 1,
  gender: false,
  genderVal: null,
  favorite: false,
};

function updateFilter(array1) {
  let array = [...array1];
  const {
    country,
    age,
    gender,
    favorite,
    countryVal,
    genderVal,
    ageVal,
  } = filterProps;
  filtered = !(!country && !age && !gender && !favorite);
  if (country) {
    array = _.filter(array, (obj) => obj.country === countryVal);
  }
  if (gender) {
    array = _.filter(array, (obj) => obj.gender === genderVal);
  }
  if (age) {
    const order = document.getElementById('order');
    if (order.checked) {
      array = _.filter(array, (obj) => obj.age > ageVal);
    } else {
      array = _.filter(array, (obj) => obj.age <= ageVal);
    }
  }
  if (favorite) {
    array = _.filter(array, (obj) => obj.favorite);
  }
  if (filtered) {
    document.getElementById('statistics')
      .setAttribute('data-filtered', `${array.length}`);
    setFiltered(array);
  } else {
    document.getElementById('statistics')
      .setAttribute('data-filtered', `${arr.length}`);
    setFiltered(arr);
  }
  infoListeners(false);
  const page1 = document.getElementById('page1');
  if (page1) {
    page1.setAttribute('href', '#0');
    page1.click();
    page1.setAttribute('href', '#statistics');
  }
}

// FILTER
document.querySelectorAll('.filter')
  .forEach((el) => {
    el.addEventListener('click', () => {
      const prop = el.getAttribute('id')
        .replace('-filter', '');
      filterProps[prop] = el.checked;
    });
  });

document.getElementById('country-filter')
  .addEventListener('change', () => {
    const input = document.getElementById('country-filter');

    if (input.checked) {
      let options = '';
      [...countries].sort((a, b) => a.localeCompare(b))
        .forEach((country) => {
          options += `<option value="${country}">${country}</option>`;
        });
      input.insertAdjacentHTML('afterend', `<select id="country-select">${options}</select>`);
      document.getElementById('country-select')
        .addEventListener('change', (event) => {
          filterProps.countryVal = `${event.target.value}`;
          updateFilter(arr);
        });
    } else {
      updateFilter(arr);
      filterProps.countryVal = null;
      document.getElementById('country-select')
        .remove();
    }
  });

document.getElementById('age-filter')
  .addEventListener('change', () => {
    const input = document.getElementById('age-filter');
    if (input.checked) {
      input.insertAdjacentHTML('afterend', '<label id="age-filter-label"><input id="age-input" name="age" type="number" min="0" max="100"/>'
        + ' older <input id="order" type="checkbox"><button id="age-btn">Ok</button></label>');
      document.getElementById('age-btn')
        .addEventListener('click', (event) => {
          event.preventDefault();
          filterProps.ageVal = document.getElementById('age-input').value;
          updateFilter(arr);
        });
    } else {
      updateFilter(arr);
      filterProps.ageVal = null;
      document.getElementById('age-filter-label')
        .remove();
    }
  });

document.getElementById('gender-filter')
  .addEventListener('change', () => {
    const input = document.getElementById('gender-filter');
    if (input.checked) {
      input.insertAdjacentHTML('afterend', '<select id="gender-select"><option>Male</option><option>Female</option></select>');
      document.getElementById('gender-select')
        .addEventListener('change', (event) => {
          filterProps.genderVal = `${event.target.value}`.toLowerCase();
          updateFilter(arr);
        });
    } else {
      updateFilter(arr);
      filterProps.genderVal = null;
      document.getElementById('gender-select')
        .remove();
    }
  });

document.getElementById('favorite-filter')
  .addEventListener('change', () => {
    const input = document.getElementById('favorite-filter');
    if (input.checked) {
      updateFilter(arr);
    } else {
      updateFilter(arr);
    }
  });

// FORM
document.getElementById('add-teacher-form')
  .addEventListener('submit', (e) => {
    e.preventDefault();
    const myForm = document.getElementById('add-teacher-form');
    const data = new FormData(myForm);
    const teacher = {
      full_name: data.get('name'),
      country: data.get('country'),
      city: data.get('city'),
      phone: data.get('phone'),
      email: data.get('email'),
      age: data.get('age'),
      gender: data.get('gender'),
      bg_color: data.get('color'),
      id: `id${Math.random()
        .toString(16)
        .slice(2)}`,
    };
    teacher.age = parseInt(`${teacher.age}`, 10);
    arr.push(formatAdd(teacher));
    countries.add(teacher.country);
    document.querySelectorAll('.filter')
      .forEach((el) => {
        if (el.checked) {
          el.click();
        }
      });
    setAll(arr);
    myForm.reset();
    searchListener();
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/teachers', true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    xhr.onload = () => {
      // console.log(`Response: ${xhr.responseText}`);
    };
    xhr.send(JSON.stringify(formatAdd(teacher)));
  });

function requestTeacher(params) {
  const xhr = new XMLHttpRequest();
  const url = `https://randomuser.me/api?results=1${queryString(params)}`;
  xhr.open('GET', url, false);
  // console.log(url);
  xhr.send(null);
  return _.map(JSON.parse(xhr.responseText)
    .results, (el) => formatAdd(format(el)));
}

document.getElementById('request')
  .addEventListener('submit', (e) => {
    e.preventDefault();
    const teacherName = document.getElementById('req-teacher');
    if (teacherName) {
      teacherName.remove();
    }
    const myForm = document.getElementById('request');
    const data = new FormData(myForm);
    const params = {};
    if (document.getElementById('req-country').checked) {
      params.nat = countryCodes[data.get('req-country-select')];
    }
    if (document.getElementById('req-gender').checked) {
      params.gender = data.get('req-gender-select');
    }
    const teacher = requestTeacher(params)[0];
    if (teacher) {
      document.getElementById('div-gender')
        .insertAdjacentHTML('afterend', `<p id="req-teacher" style="margin: 1em">${teacher.full_name}, ${teacher.age}, ${teacher.gender}, ${teacher.country}</p>`);
    }
    // myForm.reset();
  });
