(function() {
  "use strict";

  var PREFIX = "tgd-";
  var idNumber = 0;
  var header, todo, done, form, status;

  function init() {
    header = document.getElementById("header");
    todo = new ListWithCounter("todo");
    done = new ListWithCounter("done");
    form = new Form("form");
    status = document.getElementById("status");

    addTimestamp(header);
    window.addEventListener("beforeunload", handleBeforeUnload);
  }

  function createTimestamp() {
    var now = new Date();
    var datetime = typeof now.toISOString === "function" ? datetime = now.toISOString() : now.toJSON();
    var currentLanguage = navigator.language || "en";
    var dateString = now.toLocaleDateString(currentLanguage);
    var timestamp = document.createElement("time");
    timestamp.setAttribute("datetime", datetime);
    timestamp.innerText = dateString;
    return timestamp;
  }

  function addTimestamp(element) {
    var timestamp = createTimestamp();
    element.appendChild(timestamp);
  }

  /**
   * @returns {Item}
   */
  function createNewItem() {
    var newItemText = form.input.value;
    var newItem = new Item(newItemText);
    return newItem;
  }

  function addNewItem() {
    var newItem = createNewItem();
    todo.add(newItem);

    var message = "Added " + newItem.text;
    publishStatus(message);
  }

  function handleBeforeUnload(event) {
    if (thereIsSomethingTodo()) {
      event.preventDefault();
      event.returnValue = "";
    }
  }

  function thereIsSomethingTodo() {
    return todo.getItemCount() > 0;
  }

  function publishStatus(message) {
    status.innerText = message;
  }

  function Form(id) {
    this.element = document.getElementById(id);
    this.input = this.element.querySelector("input[type=\"text\"]");
    this.button = this.element.querySelector("button[type=\"submit\"]");

    this.element.addEventListener("submit", this.handleSubmit.bind(this));
    this.input.addEventListener("input", this.handleInput.bind(this));
  }

  Form.prototype.handleInput = function() {
    this.updateButtonState();
  };

  Form.prototype.clearInput = function () {
    this.input.value = "";
    this.handleInput();
  };

  Form.prototype.handleSubmit = function(event) {
    event.preventDefault();

    addNewItem();
    this.clearInput();
  };

  Form.prototype.updateButtonState = function() {
    var inputHasValue = this.input.value.length > 0;
    this.button.disabled = !inputHasValue;
  };

  function ListWithCounter(id) {
    this.element = document.getElementById(id);
    this.heading = this.element.querySelector(".heading");
    this.counter = this.element.querySelector(".counter");
    this.list = document.createElement("ul");
    this.element.appendChild(this.list);
  }

  ListWithCounter.prototype.getItemCount = function() {
    return this.list.querySelectorAll("li").length;
  };

  ListWithCounter.prototype.updateCount = function() {
    var itemCount = this.getItemCount();
    this.element.setAttribute("data-item-count", String(itemCount));
    this.counter.innerText = itemCount;
  };

  /**
   * @param {Item} item
   */
  ListWithCounter.prototype.add = function(item) {
    this.list.appendChild(item.element);
    this.updateCount();
  };

  /**
   * @param {Item} item
   */
   ListWithCounter.prototype.remove = function(item) {
    this.list.removeChild(item.element);
    this.updateCount();
  };

  function Item(itemText) {
    this.text = itemText;
    this.id = createId();

    this.element = document.createElement("li");
    this.checkbox = this.createCheckbox();
    this.label = this.createLabel();
    this.deleteButton = this.createDeleteButton();

    this.element.appendChild(this.checkbox);
    this.element.appendChild(this.label);
    this.element.appendChild(this.deleteButton);
  }

  Item.prototype.createCheckbox = function() {
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = this.id;
    checkbox.className = "visually-hidden";
    checkbox.addEventListener("change", this.handleCheckboxChange.bind(this));
    return checkbox;
  };

  Item.prototype.isChecked = function() {
    return this.checkbox.checked;
  };

  Item.prototype.handleCheckboxChange = function() {
    this.move();
  };

  Item.prototype.createVisualCheckbox = function() {
    var span = document.createElement("span");
    span.className = "visual-checkbox";
    return span;
  };

  Item.prototype.createItemText = function() {
    var span = document.createElement("span");
    span.className = "item-text";
    span.innerText = this.text;
    return span;
  };

  Item.prototype.createLabel = function() {
    var label = document.createElement("label");
    label.setAttribute("for", this.id);

    var visualCheckbox = this.createVisualCheckbox();
    var itemText = this.createItemText();
    label.appendChild(visualCheckbox);
    label.appendChild(itemText);
    return label;
  };

  Item.prototype.createDeleteButton = function() {
    var deleteButton = document.createElement("button");
    deleteButton.className = "delete";
    deleteButton.innerText = "Delete";
    deleteButton.setAttribute("aria-label", "Delete " + this.text);
    deleteButton.addEventListener("click", this.handleDeleteButtonClick.bind(this));
    return deleteButton;
  };

  Item.prototype.handleDeleteButtonClick = function() {
    this["delete"]();
  };

  Item.prototype.move = function() {
    var origin = this.isChecked() ? todo : done;
    var destination = this.isChecked() ? done : todo;

    var toFocus = todo.heading;
    var nearestElement = getNearestElement(this.element);

    if (nearestElement) {
      var nearestCheckbox = nearestElement.querySelector("input");
      toFocus = nearestCheckbox;
    }

    origin.remove(this);
    destination.add(this);

    var message = this.text + (destination === done ? " got done." : " did not get done.");
    publishStatus(message);

    toFocus.focus();
  };

  Item.prototype["delete"] = function() {
    var toFocus = todo.heading;
    var nearestElement = getNearestElement(this.element);

    if (nearestElement) {
      var nearestDelete = nearestElement.querySelector(".delete");
      toFocus = nearestDelete;
    }

    var currentList = this.isChecked() ? done : todo;
    currentList.remove(this);

    var message = "Deleted " + this.text;
    publishStatus(message);

    toFocus.focus();
  };

  function getNearestElement(element) {
    return element.nextElementSibling || element.previousElementSibling;
  }

  function createId() {
    var id = PREFIX + String(idNumber);
    idNumber++;

    return id;
  }

  function shouldLoadTestFile() {
    return window.location.search.toLowerCase().indexOf("test") !== -1;
  }

  function loadTestFile() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "to-get-done.test.js";
    document.body.appendChild(script);
  }

  init();

  if (shouldLoadTestFile()) {
    loadTestFile();
  }
}());
