

// //////////////////////Budget app


var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    var Income = function (id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
    };
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1
            ////// how to define the last ID
            //1. find out the last element of an array
            //2. attach the id property to get the Id of that last element (el)
            //3. last Id = el + 1
            // var array = [1,2,3,4,5,6];
            // var val = array[array.length - 1]; (find the last element of an array)

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }

            //Create a newItem based on type
            if (type === 'inc') {
                newItem = new Income(ID, des, val)
                //ID = last id
                //des = description
                //val = value
                // write parameters different with the constructor for making indepence. 
            } else if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            }
            // Push it into our data structure

            data.allItems[type].push(newItem);

            return newItem
        },
        deleteItem: function (type, id) {
            //ids = [1 2 4 6 8]
            //index = 3

            // what "map" method does:  - create a copy of an array 
            //- put every single element of an array to the parameter of its function.
            //- execute the function and the output is a array as well.(ids is an array) 

            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            //current is an item of data.allItem[type]     
            //current.id: trong data.allItem co 3 PROPERTIES, minh chi lay properties chua id cua item
            //ids is an array
            //after ids = data.allItems[type].map(function (current) {return current.id}) -> create EXACTLY THE SAME array of data.allItem[type] 
            index = ids.indexOf(id);
            //index is the posisition of an el in an array. index here means index of el we want to remove

            //index could be equal -1 when id isnt found in the array. we only want to delete something in the array.

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            //cal total income and expense
            calculateTotal('exp');
            calculateTotal('inc');

            //cal the budget : income - expense
            data.budget = data.totals.inc - data.totals.exp;

            //cal the percentage of expense out of income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calPercentage(data.totals.inc);
            })
        },
        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage()
            })
            return allPerc;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data);
        }
    }
})();

var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incLabel: '.budget__income--value',
        expLabel: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        //1. - or + before numbers
        //2. 2 decimals -> using ta method for number called toFixed (the output is not a number-type anymore, it is a string)
        //3. comma seperating thousands
        // 2345.5678 -> 2,345.57
        //WHAT TO DO 
        // working with the number itself
        // convert number to number-with-2-decimals

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)/// if input 2019, output is 2,019
        }
        dec = numSplit[1];

        return (type === 'exp' ? '+' : '-') + ' ' + int + '.' + dec

    };
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                //.value: the value of the type, the value of the description
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                //parseFloat: chuyen string sang number

            }
        },
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = ""
            });
            fieldsArr[0].focus()
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem: function (selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);

        },
        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expLabel).textContent = obj.totalExp;
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentage).textContent = '---'
            }
        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'
                } else {
                    current.textContent = '---'
                }
            });
        },
        displayDate: function () {
            var now, month, year;
            now = new Date();
            month = now.getMonth()
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changeType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('orange-focus')
            });
            document.querySelector(DOM.inputBtn).classList.toggle('orange')
        },
        getDOMstrings: function () {
            return DOMstrings
        },
    }

})();

var controller = (function (budgetCtrl, uiCtrl) {
    var setupEventListener = function () {
        DOM = uiCtrl.getDOMstrings();
        console.log('started');
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrAddItem()
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrDeleteItem);
        // instead of adding event listener into all elements are interested in, we use delegation to add event listener to the place where elements have things in common.(DOM container)
        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType)
    };

    var updateBudget = function () {
        //calculate 
        budgetCtrl.calculateBudget()

        //return the budget
        var budget = budgetCtrl.getBudget()

        //display to UI
        uiCtrl.displayBudget(budget)

    };
    var updatePercentage = function () {
        // 1. calculate the percentage
        budgetCtrl.calculatePercentages();

        //2.read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        //update UI with the new percentages
        uiCtrl.displayPercentages(percentages);



    };
    var ctrAddItem = function () {
        var input, newItem
        //1 get input
        input = uiCtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // console.log(input);

            //2 addthe item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3 add the item to the UI 
            uiCtrl.addListItem(newItem, input.type);

            //4 clear fields
            uiCtrl.clearFields();

            //5. Calculate
            updateBudget();

            //4. Update the percentages from budget controller and update in to UI
            updatePercentage();
        }
    };
    var ctrDeleteItem = function (event) {
        var itemID, splitID, type, ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');

            type = splitID[0];

            ID = parseInt(splitID[1]);

            //1. delete item from data structure (implemented in budget controller)
            budgetController.deleteItem(type, ID)
            //2. delete item from UI
            uiCtrl.deleteListItem(itemID)

            //3. update calculation
            updateBudget();

            //4. Update the percentages from budget controller and update in to UI
            updatePercentage();
        }

    }
    return {
        init: function () {
            setupEventListener();
            uiCtrl.displayDate();
            uiCtrl.displayBudget(
                {
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                })


        }
    }
})(budgetController, UIController)

controller.init()    
