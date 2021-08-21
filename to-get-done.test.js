(function() {
  "use strict";

  var testValueNumber = 0;
  var tests = [];

  function Test(description, testFunction) {
    this.description = description;
    this.name = testFunction.name;
    this.func = testFunction;
    this.errorMsg = "";
  }

  tests.push(new Test(
    "One h1 element should exist.", function testOneH1() {
      var h1Elements = document.querySelectorAll("h1");
      if (h1Elements.length !== 1) {
        this.errorMsg = "Expected number of <h1> elements on page: 1. Actual number: " + String(h1Elements.length);
        return false;
      }
      return true;
    }
  ));

  tests.push(new Test(
    "Timestamp added to header", function testTimestampAddedToHeader(ui) {
      return ui.timestamp !== null;
    }
  ));

  tests.push(new Test(
    "Timestamp has datetime attribute set", function testTimestampHasDatetime(ui) {
      var datetimeAttr = ui.timestamp.getAttribute("datetime");
      return datetimeAttr !== null && datetimeAttr !== "";
    }
  ));

  tests.push(new Test(
    "Todo counter zero at start", function testTodoCounterZeroAtStart(ui) {
      if (ui.todoCounter.innerText !== "0") {
        this.errorMsg = "Expected todo counter value: 0. Actual value: " + ui.todoCounter.innerText;
        return false;
      }
      return true;
    }
  ));

  tests.push(new Test(
    "Todo list empty at start", function testTodoListEmptyAtStart(ui) {
      var todoListItems = getListItems(ui.todoList);
      return todoListItems.length === 0;
    }
  ));

  tests.push(new Test(
    "Add button disabled at start", function testAddButtonDisabledAtStart(ui) {
      return ui.addButton.disabled === true;
    }
  ));

  tests.push(new Test(
    "Done section hidden at start", function testDoneSectionHiddenAtStart(ui) {
      return elementIsHidden(ui.doneSection);
    }
  ));

  tests.push(new Test(
    "Done counter zero at start", function testDoneCounterZeroAtStart(ui) {
      if (ui.doneCounter.innerText !== "0") {
        this.errorMsg = "Expected todo counter value: 0. Actual value: " + ui.doneCounter.innerText;
        return false;
      }
      return true;
    }
  ));

  tests.push(new Test(
    "Done list empty at start", function testDoneListEmptyAtStart(ui) {
      var doneListItems = getListItems(ui.doneList);
      return doneListItems.length === 0;
    }
  ));

  tests.push(new Test(
    "Add button enabled after input event (with input value)", function testAddButtonEnabledAfterInput(ui) {
      triggerTextInput(ui.newItemInput, createTestValue());
      return ui.addButton.disabled === false;
    }
  ));

  tests.push(new Test("Added new item appears in todo list", function testAddedItemInTodoList(ui) {
    var testValue = createTestValue();
    addItem(testValue);
    var todoListItems = getListItems(ui.todoList);

    if (todoListItems.length !== 1) {
      this.errorMsg = "Expected number of items in todo list: 1. Actual number: " + String(todoListItems.length);
      return false;
    }

    var item = todoListItems[0];
    var itemText = item.querySelector(".item-text");
    return itemText.innerText === testValue;
  }));

  tests.push(new Test("Checking item in todo list moves it to done list", function testCheckedItemMovedToDoneList(ui) {
    var testValue = createTestValue();
    addItem(testValue);

    var item = findListItemByText(testValue);
    clickListItemCheckbox(item);

    if (ui.todoList.contains(item)) return false;
    return ui.doneList.contains(item);
  }));

  tests.push(new Test("Unchecking item in done list moves it back to done list", function testUncheckedItemMovedToTodoList(ui) {
    var testValue = createTestValue();
    addItem(testValue);

    var item = findListItemByText(testValue);
    clickListItemCheckbox(item);

    if (ui.todoList.contains(item)) return false;
    if (!ui.doneList.contains(item)) return false;

    clickListItemCheckbox(item);

    if (ui.doneList.contains(item)) return false;
    return ui.todoList.contains(item);
  }));

  tests.push(new Test("Deleting item removes it from the DOM.", function testDeletedItemRemovedFromDom(ui) {
    var testValue = createTestValue();
    addItem(testValue);

    var item = findListItemByText(testValue);
    clickListItemDeleteButton(ui.todoList, 0);

    if (ui.todoList.contains(item)) return false;
    if (ui.doneList.contains(item)) return false;

    return !document.contains(item);
  }));

  tests.push(new Test("Counts are updated when items are added, checked, unchecked, deleted", function testCountsUpdated(ui) {
    var testValue1 = createTestValue();
    var testValue2 = createTestValue();
    var testValue3 = createTestValue();
    var testValue4 = createTestValue();

    addItem(testValue1);
    addItem(testValue2);
    addItem(testValue3);
    addItem(testValue4);

    if (ui.todoCounter.innerText !== "4") return false;
    if (ui.todoSection.getAttribute("data-item-count") !== "4") return false;
    if (ui.doneCounter.innerText !== "0") return false;
    if (ui.doneSection.getAttribute("data-item-count") !== "0") return false;

    var item1 = findListItemByText(testValue1);
    var item2 = findListItemByText(testValue2);
    var item3 = findListItemByText(testValue3);
    var item4 = findListItemByText(testValue4);

    clickListItemCheckbox(item1);
    clickListItemCheckbox(item2);
    clickListItemCheckbox(item3);

    if (ui.todoCounter.innerText !== "1") return false;
    if (ui.todoSection.getAttribute("data-item-count") !== "1") return false;
    if (ui.doneCounter.innerText !== "3") return false;
    if (ui.doneSection.getAttribute("data-item-count") !== "3") return false;

    clickListItemCheckbox(item2);
    clickListItemCheckbox(item3);

    if (ui.todoCounter.innerText !== "3") return false;
    if (ui.todoSection.getAttribute("data-item-count") !== "3") return false;
    if (ui.doneCounter.innerText !== "1") return false;
    if (ui.doneSection.getAttribute("data-item-count") !== "1") return false;

    clickListItemDeleteButton(item1);
    clickListItemDeleteButton(item4);

    if (ui.todoCounter.innerText !== "2") return false;
    if (ui.todoSection.getAttribute("data-item-count") !== "2") return false;
    if (ui.doneCounter.innerText !== "0") return false;
    if (ui.doneSection.getAttribute("data-item-count") !== "0") return false;

    return true;
  }));

  tests.push(new Test("Focus is handled when items are checked, unchecked, deleted", function testFocusHandled(ui) {
    var testValue1 = createTestValue();
    var testValue2 = createTestValue();
    var testValue3 = createTestValue();
    var testValue4 = createTestValue();

    addItem(testValue1);
    addItem(testValue2);
    addItem(testValue3);
    addItem(testValue4);

    var item1 = findListItemByText(testValue1);
    var checkbox1 = item1.querySelector("input");

    var item2 = findListItemByText(testValue2);
    var checkbox2 = item2.querySelector("input");
    var delete2 = item2.querySelector(".delete");

    var item3 = findListItemByText(testValue3);
    var checkbox3 = item3.querySelector("input");

    var item4 = findListItemByText(testValue4);
    var checkbox4 = item4.querySelector("input");

    clickListItemCheckbox(item1);
    if (checkbox2 !== document.activeElement) return false;

    clickListItemCheckbox(item2);
    if (checkbox3 !== document.activeElement) return false;

    clickListItemCheckbox(item3);
    if (checkbox4 !== document.activeElement) return false;

    clickListItemCheckbox(item2);
    if (checkbox3 !== document.activeElement) return false;

    clickListItemCheckbox(item3);
    if (checkbox1 !== document.activeElement) return false;

    clickListItemDeleteButton(item1);
    if (ui.todoHeading !== document.activeElement) return false;

    clickListItemDeleteButton(item4);
    if (delete2 !== document.activeElement) return false;

    return true;
  }));

  tests.push(new Test("Plural suffices are hidden when count is 1 - displayed otherwise.", function testPluralSufficesDisplayedWhereAppropriate(ui) {
    ui.todoSection.setAttribute("data-item-count", 0);
    if (elementIsHidden(ui.todoPlural)) {
      this.errorMsg = "Todo plural should be visible when count is 0";
      return false;
    }

    ui.todoSection.setAttribute("data-item-count", 1);
    if (!elementIsHidden(ui.todoPlural)) {
      this.errorMsg = "Todo plural should be hidden when count is 1";
      return false;
    }

    ui.todoSection.setAttribute("data-item-count", 2);
    if (elementIsHidden(ui.todoPlural)) {
      this.errorMsg = "Todo plural should be visible when count is 2";
      return false;
    }

    ui.doneSection.setAttribute("data-item-count", 0);
    if (!elementIsHidden(ui.donePlural)) {
      this.errorMsg = "Done plural (along with entire done section) should be hidden when count is 0";
      return false;
    }

    ui.doneSection.setAttribute("data-item-count", 1);
    if (!elementIsHidden(ui.donePlural)) {
      this.errorMsg = "Done plural should be hidden when count is 1";
      return false;
    }

    ui.doneSection.setAttribute("data-item-count", 2);
    if (elementIsHidden(ui.donePlural)) {
      this.errorMsg = "Done plural should be visible when count is 2";
      return false;
    }

    return true;
  }));

  /**
   * @param {Test[]} tests
   */
  function runTests(tests) {
    if (!tests.length) return;

    var passes = [];
    var failures = [];

    for (var i = 0; i < tests.length; i++) {
      try {
        var test = tests[i];
        testTestIsTest(test);

        var ui = getUI();
        var beforeUIState = getUIState(ui);

        var result = test.func(ui);
        setUIState(ui, beforeUIState);

        if (result === true) {
          passes.push(test);
        } else if (result === false) {
          failures.push(test);
        } else {
          throw "Tests should explicitly return true or false";
        }

      } catch (error) {
        alert("There was an error while running tests.\n\nSee console for details.");
        console.error(error);
        return;
      }
    }

    return {
      tests: tests,
      passes: passes,
      failures: failures
    };
  }

  /**
   * @param {Test} test
   */
  function testTestIsTest(test) {
    if (!(test instanceof Test)) {
      throw "Test should be an instance of Test class";
    }

    if (typeof test.description !== "string") {
      throw "Test description should be a string";
    }

    if (typeof test.func !== "function") {
      throw "Test function should be a function";
    }
  }

  function reportTestSummary(summary) {
    if (!summary) return;

    logSummary(summary);

    if (summary.failures.length > 0) {
      alertFailures(summary.failures);
      logFailures(summary.failures);
    }
  }

  function logSummary(summary) {
    console.log("------------");
    console.log("Test summary");
    console.log("------------");
    console.log("Number of tests:    ", summary.tests.length);
    console.log("Number of passes:   ", summary.passes.length);
    console.log("Number of failures: ", summary.failures.length);
  }

  function logFailures(failures) {
    console.log("------------");
    console.log("Failed tests");
    console.log("------------");
    for (var i = 0; i < failures.length; i++) {
      var failure = failures[i];
      console.log(failure.name, " - ", failure.description);
      if (failure.errorMsg) {
        console.log("> " + failure.errorMsg);
      }
    }
  }

  function alertFailures(failures) {
    var alertContent = "\nNumber of failed tests: " + String(failures.length) +
      "\n\nSee console for more details.";
    alert(alertContent);
  }

  function getUI() {
    return {
      header: document.querySelector("header"),
      timestamp: document.querySelector("time"),
      todoSection: document.querySelector("#todo"),
      todoHeading: document.querySelector("#todo-heading"),
      todoCounter: document.querySelector("#todo .counter"),
      todoPlural: document.querySelector("#todo .plural"),
      todoList: document.querySelector("#todo ul"),
      form: document.querySelector("form"),
      newItemInput: document.querySelector("#new"),
      addButton: document.querySelector("#add"),
      doneSection: document.querySelector("#done"),
      doneCounter: document.querySelector("#done .counter"),
      donePlural: document.querySelector("#done .plural"),
      doneList: document.querySelector("#done ul"),
      status: document.querySelector("#status")
    };
  }

  function getUIState(ui) {
    var state = {
      todoItemCountAttributeValue: ui.todoSection.getAttribute("data-item-count"),
      todoCounterInnerText: ui.todoCounter.innerText,
      todoListInnerHTML: ui.todoList.innerHTML,
      newItemInputValue: ui.newItemInput.value,
      addButtonDisabled: ui.addButton.disabled,
      doneItemCountAttributeValue: ui.doneSection.getAttribute("data-item-count"),
      doneCounterInnerText: ui.doneCounter.innerText,
      doneListInnerHTML: ui.doneList.innerHTML,
      statusInnerText: ui.status.innerText
    };
    return state;
  }

  function setUIState(ui, state) {
    ui.todoSection.setAttribute("data-item-count", state.todoItemCountAttributeValue);
    ui.todoCounter.innerText = state.todoCounterInnerText;
    ui.todoList.innerHTML = state.todoListInnerHTML;
    ui.newItemInput.value = state.newItemInputValue;
    ui.addButton.disabled = state.addButtonDisabled;
    ui.doneSection.setAttribute("data-item-count", state.doneItemCountAttributeValue);
    ui.doneCounter.innerText = state.doneCounterInnerText;
    ui.doneList.innerHTML = state.doneListInnerHTML;
    ui.status.innerText = state.statusInnerText;
  }

  function getListItems(container) {
    return container.querySelectorAll("li");
  }

  function findListItemByText(text, container) {
    if (!container) {
      container = document;
    }

    var listItems = getListItems(container);
    for (var i = 0; i < listItems.length; i++) {
      var item = listItems[i];
      var itemText = item.querySelector(".item-text");
      if (text === itemText.innerText) {
        return item;
      }
    }
    return null;
  }

  function createTestValue() {
    var testValue = "Test value " + String(testValueNumber);
    testValueNumber++;
    return testValue;
  }

  function addItem(value) {
    if (!value) {
      value = createTestValue();
    }
    var newItemInput = document.querySelector("#new");
    var form = document.querySelector("form");
    triggerTextInput(newItemInput, value);
    triggerSubmit(form);
  }

  function clickListItemCheckbox(item) {
    var visualCheckbox = item.querySelector(".visual-checkbox");
    visualCheckbox.click();
  }

  function clickListItemDeleteButton(item) {
    var deleteButton = item.querySelector(".delete");
    deleteButton.click();
  }

  function triggerTextInput(input, value) {
    input.value = value;
    input.dispatchEvent(new window.InputEvent("input"));
  }

  function triggerSubmit(form) {
    form.dispatchEvent(new window.SubmitEvent("submit"));
  }

  function elementIsHidden(element) {
    return element.offsetParent === null;
  }

  function shuffleArray(array) {
    var currentIndex = array.length;
    var temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  shuffleArray(tests);
  var summary = runTests(tests);
  reportTestSummary(summary);
}());
