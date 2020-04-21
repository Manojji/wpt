// Clicks on the element with the given ID. It adds an event handler to the element which
// ensures that the events have a duration of at least |delay|. Calls |callback| during
// event handler if |callback| is provided.
async function clickOnElementAndDelay(id, delay, callback) {
  const element = document.getElementById(id);
  const clickHandler = () => {
    mainThreadBusy(delay);
    if (callback)
      callback();
    element.removeEventListener("mousedown", clickHandler);
  };
  element.addEventListener("mousedown", clickHandler);
  await test_driver.click(element);
}

function mainThreadBusy(duration) {
  const now = performance.now();
  while (performance.now() < now + duration);
}

// This method should receive an entry of type 'event'. |isFirst| is true only when we want
// to check that the event also happens to correspond to the first event. In this case, the
// timings of the 'first-input' entry should be equal to those of this entry. |minDuration|
// is used to compared against entry.duration.
function verifyClickEvent(entry, targetId, isFirst=false, minDuration=104) {
  assert_true(entry.cancelable);
  assert_equals(entry.name, 'mousedown');
  assert_equals(entry.entryType, 'event');
  assert_greater_than_equal(entry.duration, minDuration,
      "The entry's duration should be greater than or equal to " + minDuration + " ms.");
  assert_greater_than(entry.processingStart, entry.startTime,
      "The entry's processingStart should be greater than startTime.");
  assert_greater_than_equal(entry.processingEnd, entry.processingStart,
      "The entry's processingEnd must be at least as large as processingStart.");
  // |duration| is a number rounded to the nearest 8 ms, so add 4 to get a lower bound
  // on the actual duration.
  assert_greater_than_equal(entry.duration + 4, entry.processingEnd - entry.startTime,
      "The entry's duration must be at least as large as processingEnd - startTime.");
  if (isFirst) {
    let firstInputs = performance.getEntriesByType('first-input');
    assert_equals(firstInputs.length, 1, 'There should be a single first-input entry');
    let firstInput = firstInputs[0];
    assert_equals(firstInput.name, entry.name);
    assert_equals(firstInput.entryType, 'first-input');
    assert_equals(firstInput.startTime, entry.startTime);
    assert_equals(firstInput.duration, entry.duration);
    assert_equals(firstInput.processingStart, entry.processingStart);
    assert_equals(firstInput.processingEnd, entry.processingEnd);
    assert_equals(firstInput.cancelable, entry.cancelable);
  }
  if (targetId)
    assert_equals(entry.target, document.getElementById(targetId));
}

function wait() {
  return new Promise((resolve, reject) => {
    step_timeout(() => {
      resolve();
    }, 0);
  });
}

function clickAndBlockMain(id) {
  return new Promise((resolve, reject) => {
    clickOnElementAndDelay(id, 120, resolve);
  });
}
