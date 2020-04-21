// META: script=/resources/testdriver.js
// META: script=/resources/testdriver-vendor.js
// META: script=/bluetooth/resources/bluetooth-test.js
// META: script=/bluetooth/resources/bluetooth-helpers.js
// Generated by //third_party/WebKit/LayoutTests/bluetooth/generate.py
'use strict';
const test_desc = 'Serial Number String characteristic is blocklisted. ' +
    'Should reject with SecurityError.';
const expected = new DOMException(
    'getCharacteristic(s) called with blocklisted UUID. https://goo.gl/4NeimX',
    'SecurityError');

bluetooth_test(
    () => getHIDDevice({filters: [{services: ['device_information']}]})
              .then(
                  ({device}) =>
                      device.gatt.getPrimaryService('device_information'))
              .then(
                  service => assert_promise_rejects_with_message(
                      service.getCharacteristics('serial_number_string'),
                      expected,
                      'Serial Number String characteristic is blocklisted.')),
    test_desc);
