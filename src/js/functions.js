import * as _ from 'lodash';

// format additional user
function formatAdd(obj) {
  const resObj = {};
  const propArr = ['gender', 'title', 'full_name', 'city', 'state', 'country',
    'postcode', 'email', 'b_date', 'age', 'phone',
    'picture_thumbnail', 'favorite', 'course', 'bg_color', 'note'];
  for (let i = 0; i < propArr.length; i += 1) {
    resObj[propArr[i]] = obj[propArr[i]] ? obj[propArr[i]] : null;
  }

  resObj.id = obj.id ? obj.id : `id${Math.random().toString(16).slice(2)}`;

  resObj.favorite = obj.favorite ? obj.favorite : false;

  resObj.picture_large = obj.picture_large ? obj.picture_large : 'images/image.jpg';

  resObj.coordinates = {
    latitude: obj.coordinates ? obj.coordinates.latitude : null,
    longitude: obj.coordinates ? obj.coordinates.longitude : null,
  };
  resObj.timezone = {
    offset: obj.timezone ? obj.timezone.offset : null,
    description: obj.timezone ? obj.timezone.description : null,
  };
  return resObj;
}

function format(obj) {
  // eslint-disable-next-line no-nested-ternary
  const pic = obj.picture ? obj.picture.large ? obj.picture.large : 'images/image.jpg' : 'images/image.jpg';
  return {
    gender: obj.gender,
    title: obj.name.title,
    full_name: `${obj.name.first} ${obj.name.last}`,
    city: obj.location.city,
    state: obj.location.state,
    country: obj.location.country,
    postcode: obj.location.postcode,
    coordinates: {
      latitude: obj.location.coordinates.latitude,
      longitude: obj.location.coordinates.longitude,
    },
    timezone: {
      offset: obj.location.timezone.offset,
      description: obj.location.timezone.description,
    },
    email: obj.email,
    b_date: obj.dob.date,
    age: obj.dob.age,
    phone: obj.phone,
    picture_large: pic,
    picture_thumbnail: obj.picture.thumbnail,
  };
}

function formatObjects(array, array2) {
  // returns a single object formatted
  const newArray = [];

  // Here we add the properties to existing teachers
  for (let i = 0; i < array.length; i += 1) {
    const formatted = format(array[i]);
    const add = array2.filter((obj) => obj.full_name === formatted.full_name);
    const present = add.length === 1;
    formatted.id = present ? add[0].id : `id${Math.random().toString(16).slice(2)}`;
    formatted.favorite = present ? add[0].favorite : false;
    formatted.course = present ? add[0].course : null;
    formatted.bg_color = present ? add[0].bg_color : null;
    formatted.note = present ? add[0].note : null;
    if (!formatted.picture_large) {
      formatted.picture_large = 'images/image.jpg';
    }
    newArray.push(formatted);
  }

  // new teachers
  for (let i = 0; i < array2.length; i += 1) {
    const add = newArray.filter((obj) => obj.full_name === array2[i].full_name);
    if (add.length === 0) {
      const newUser = formatAdd(array2[i]);
      newArray.push(newUser);
    }
  }
  return newArray;
}

function validateObject(obj) {
  function string(prop) {
    return typeof prop === 'string' && prop ? prop.charAt(0) === prop.charAt(0)
      .toUpperCase() : false;
  }
  return {
    full_name: string(obj.full_name),
    gender: (obj.gender === 'male' || obj.gender === 'female'),
    note: typeof obj.note === 'string',
    state: string(obj.state),
    city: string(obj.city),
    country: string(obj.country),
    age: typeof obj.age === 'number' && obj.age > 0,
    phone: (/\(?[0-9]{3}\)?-?\(?[0-9]{3}\)?-?[0-9]{4}/).test(obj.phone),
    email: (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/).test(obj.email),
  };
}

function filterArray(array, prop, value) {
  return _.filter(array, (obj) => obj[prop] === value);
}

function sortArray(array, prop, ascending) {
  let ascend = ascending;
  if (ascending !== 1 && ascending !== -1) {
    ascend = -1;
  }
  return ascend === 1 ? _.sortBy(array, [prop]) : _.sortBy(array, [prop]).reverse();
}

function findObject(array, prop, value) {
  return _.find(array, (obj) => obj[prop] === value);
}

function percentage(array, prop, value) {
  return Math.round(100 * (filterArray(array, prop, value).length / array.length));
}

export {
  formatObjects, validateObject, filterArray, sortArray, findObject, percentage, formatAdd, format,
};
