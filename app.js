// has data privacy not accessed through outside
// returns object that we want to be public
// anonymous function invoked for budgetController
var budgetController = (function() {

  // unique ID for income and expenses
  // using function constructor, all data coming in will inherit
  // these methods
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {

    if (totalIncome > 0) {
      //store the percentage in the Expense function constructor
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  // only returns the expense percentage, top calculates it
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    //exp or inc for type
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum; // add to the data structure below

    /* for example if our first sum is 0, with array [200,400,100]
    sum = 0 + 200 = 200
    then our next sum would be sum = 200 + 400 = 600
    and 700 in the end */
  };

  // to store all expenses and incomes we use arrays
  // where we place all the information gathered from user
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1 // set to minus 1 because it is initially nonexistent
  };

  // new expense addition can be income or expenses
  // stored in the data structure above
  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      // creating a new ID using the index of the postion in the data structure
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // creating new item based on 'inc' or 'exp'
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc'){
        newItem = new Income(ID, des, val);
      }

      // add to the data structure the newItem, push adds to the end of array
      data.allItems[type].push(newItem)

      // returning the new item
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      //recieves a call back function that gives current index of array
      //returns a brand new array
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      //obtaining the index with that id in ids
      index = ids.indexOf(id);

      //here we actually delete elements using splice
      if (index !== -1) {
        //remove the number with the index and only 1 element
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {

      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Only calculate if the income is already greater than 0
      // calculate the percentage of income that we spent on expenses
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },

    //calculates budget percentages based on the income, this function to just
    //call it
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        //store it in totals
        cur.calcPercentage(data.totals.inc);
      });

    },

    //loops over all expenses to get percentages
    //also to store
    getPercentages: function() {
      //returns and stores in a variable using map
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      //returns array with all the percentages
      return allPerc;

    },
    // using both total incomes and total expenses
    // this is the object of info to return after every update
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    }
  };

})();

// obtains input from the website description bars
var UIController = (function() {

  var formatNumber = function (num, type) {
    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    //using ternary operator instead of if statement
    //if type is expense then the sign is - else the sign is +
    return (type === 'exp' ? '-': '+') + ' ' + int + '.' + dec;
  };

  // public method to read input, called by global app controller
  // returns an object
  return {
    getInput: function () {
      return {
        type: document.querySelector('.add__type').value, //either inc or exp
        description: document.querySelector('.add__description').value,
        value: parseFloat(document.querySelector('.add__value').value) // parse string into a float number
      };

    },
    addListItem: function(obj, type) {
      var html, newHTML, element;

      //1. create HTMl string with placeholder text
      if (type === 'inc') {
        element = '.income__list';
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp'){
        element = '.expenses__list';
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //2. replace the placeholder text with some actual data from object recieved
      // replace id with the obj of the id and overwrite the new HTML
      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

      //3. insert HTML to DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

    },

    // remove item from the DOM using child method
    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    //to clear input fields after each addition or subtraction
    clearFields: function() {
      var fields, fieldsArray;
      fields = document.querySelectorAll('.add__description' + ', ' + '.add__value');

      fieldsArray = Array.prototype.slice.call(fields); // trick slice method to give it an array so it returns array

      //using for each method, applied to each element in the array instead of for loop
      fieldsArray.forEach(function(current, index, array) {
        current.value = ""; // turned back to empty string
      });
      // the start of the typing goes back to description
      fieldsArray[0].focus();
    },

    //replace the values from the index.html with the object in getBudget
    displayBudget: function(obj) {

      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector('.budget__value').textContent = formatNumber(obj.budget, type);
      document.querySelector('.budget__income--value').textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExp, 'exp');

      // show percentage if it is only greater than 0, only when you actually have income
      if (obj.percentage > 0) {
        document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + '%';
      } else {
        document.querySelector('.budget__expenses--percentage').textContent = '---';
      }
    },

    //display in the expenses
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll('.item__percentage');

      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(current, index) {

        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function() {
      var now, year, month, months;
      now = new Date();

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();

      year = now.getFullYear(); //returns the year right now
      document.querySelector('.budget__title--month').textContent = months[month] + ' ' + year;

    }

  };

})();

// Global app controller
// connect budgetController and UIController
// returns the two controllers
var controller = (function(budgetCtrl, UICtrl) {

  var updateBudget = function() {

    //1. Calculate the budget
    budgetCtrl.calculateBudget();

    //2. Return the budget
    var budget = budgetCtrl.getBudget();

    //3. Display the button on the UI
    UICtrl.displayBudget(budget);
    //console.log(budget);

  };

  //when we add an income or delete an income, the percentages should be updated
  var updatePercentages = function() {
    //1. Calculate percentages
    budgetCtrl.calculatePercentages();

    //2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    //3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);

  };

  var ctrlAddItem = function() {
    var input, newItem;

  //1. Get filled-in input data
  input = UICtrl.getInput();
  //console.log(input);

  //prevents description that is empty to be allowed to added or subtracted
  //prevents a value that not greater than and if value is not a number
  if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
    //2. Add the item to the budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value)

    //3. add the item to the UI
    UICtrl.addListItem(newItem, input.type)

    //4. Clear input fields
    UICtrl.clearFields();

    //5. Calculate and update budget
    updateBudget();

    //6. Calculate and update percentages
    updatePercentages();
  }

};

// target where the event was fired, here we delete items when clicking x
var ctrlDeleteItem = function (event) {
  var itemID, splitID, type, ID;
  //we want the parent node of the event.target upwards 4 times if we are deleting it
  //deleting the html tags
  itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
  //console.log(itemID);

  if (itemID){
    splitID = itemID.split('-');
    type = splitID[0];

    //ID needs to be converted to an int rather than leaving it a string
    ID = parseInt(splitID[1]);

    // delete the item from data structure
    budgetCtrl.deleteItem(type, ID);

    // delete item from UI
    UICtrl.deleteListItem(itemID);

    // update and show the new budget to UI
    updateBudget();

    // Calculate and update percentages
    updatePercentages();
  }
};

  //display the current Date
  UICtrl.displayMonth();

  // for the checkmark button if clicked and if enter button pressed
  document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);
    //console.log('Button clicked.');

  // works anywhere on the document, keycode for enter is 13
  // 'which' is for older browsers
  document.addEventListener('keypress', function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        //console.log('enter key is pressed.');
        ctrlAddItem();
      }

  });

  document.querySelector('.container').addEventListener('click', ctrlDeleteItem);

})(budgetController, UIController);
