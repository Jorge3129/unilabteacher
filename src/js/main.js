/* eslint-disable */

// import {
//   formatObjects, validateObject, filterArray, sortArray, findObject, percentage,
// } from './functions';

// import {
//   randomUserMock as randomUsers, additionalUsers as additional,
// } from './mock_for_L3';

const {formatObjects, validateObject, filterArray, sortArray, findObject, percentage} = require('./functions');

const mock = require('./mock_for_L3');
const randomUsers = mock.randomUserMock;
const additional = mock.additionalUsers;

const arr = formatObjects(randomUsers, additional);
for (let i = 0; i < 10; i += 1) {
  console.log(arr[i]);
}
console.log(validateObject(arr[0]));

console.log(filterArray(arr, 'country', 'Iran').map((obj) => obj.country));

const arr2 = sortArray(arr, 'country', 1);
for (let i = 0; i < arr2.length; i += 1) {
  console.log(arr2[i].country);
}

const arr4 = sortArray(arr, 'full_name', 1);
for (let i = 0; i < arr4.length; i += 1) {
  console.log(arr4[i].full_name);
}

const arr3 = sortArray(arr, 'b_date', 1);
for (let i = 0; i < arr3.length; i += 1) {
  console.log(arr3[i].b_date);
}

console.log(findObject(arr, 'full_name', 'Norbert Weishaupt'));

console.log(findObject(arr, 'phone', '0079-8291509'));

console.log(percentage(arr, 'country', 'United States'));
