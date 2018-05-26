//BUDGET CONTROLLER
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentages = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allitems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentages: -1
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allitems[type].forEach(function (current) {
            sum += current.value;

        });

        data.totals[type] = sum;
    };


    return {
        addItem: function (type, des, val) {
            var newItem, ID;


            //Create new Id
            if (data.allitems[type].length > 0) {
                ID = data.allitems[type][data.allitems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //CREATE A NEW ITEM BASED ON ITS TYPE
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }
            //PUSH THE NEW ITEM TO OUR DATA STRUCTURE
            data.allitems[type].push(newItem);

            //RETURN THE NEW ELEMENT
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allitems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allitems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {
            //calculate total income andexpences
            calculateTotal("inc");
            calculateTotal("exp");

            //calculate the budget :income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentages of income that we spent
            if (data.totals.inc > 0) {
                data.percentages = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentages = -1;
            }
        },
        calculatePercentages: function () {
            data.allitems.exp.forEach(function (current) {
                current.calcPercentages(data.totals.inc);
            })
        },
        getPercentage: function () {
            var allPerc = data.allitems.exp.map(function (cur) {
                return cur.percentage;
            })
            return allPerc;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentages: data.percentages
            }
        },
        testing: function () {
            console.log(data);
        }
    }
})();


//  UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputbtn: ".add__btn",
        incomeContainer: ".income__list",
        expenceContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensespercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    }
    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        /*
        + or - befor number 
        exactly 2 decimal points
        comma eperated the thousands
        */
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }


        return (type === "exp" ? "-" : "+") + " " + int + "." + numSplit[1];
    };
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }
    return {
        getInput: function () {

            return {
                type: document.querySelector(DOMstrings.inputType).value, //will we either "inc" or "exp"
                description: document.querySelector(DOMstrings.inputDescription).value,
                values: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            //create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = ' <div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expenceContainer;
                html = '  <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            //Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },
        deleteListItem: function (selectorId) {
            var element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);
        },
        clearFeilds: function () {
            //   document.querySelector(DOMstrings.inputType).value="inc";
            document.querySelector(DOMstrings.inputDescription).value = "";
            document.querySelector(DOMstrings.inputDescription).focus();
            document.querySelector(DOMstrings.inputValue).value = "";
        },
        displayBudget: function (obj) {

            obj.budget > 0 ? type = "inc" : type = "exp";
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");

            if (obj.percentages > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentages + "%";

            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";

            }
        },
        displayPercentages: function (percentages) {
            var feilds = document.querySelectorAll(DOMstrings.expensespercentageLabel);

       

            nodeListForEach(feilds, function (current, index) { //this inside function is not called immediately it is called by the nodeListforEach function
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            })
        },
        displayMonth: function () {
            var now, year, month,months;
            now = new Date();//return current date
            months = ["January","February","March","April","May","June","july","August","October","September","November","December"];
            month=now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " "+year;
        },
        changeType:function(){
            var feild = document.querySelectorAll(DOMstrings.inputType + "," +
            DOMstrings.inputDescription + 
            ","+DOMstrings.inputValue);
            nodeListForEach(feild,function(cur){
                cur.classList.toggle("red-focus");

            })
            document.querySelector(DOMstrings.inputbtn).classList.toggle("red");
        },
        getDOMstrings: function () {
            return DOMstrings
        }
    };
})();


//  GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {


    var setUpEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputbtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (eventkey) {
            if (eventkey.keyCode === 13 || eventkey.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change",UICtrl.changeType);
    };

    var updateBudget = function () {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2.return the budget
        var budget = budgetCtrl.getBudget();

        //3..Display the budget on the UI
        UICtrl.displayBudget(budget);

    }
    var updatePercentages = function () {
        //calculate the percentages
        budgetCtrl.calculatePercentages();
        //read percentages from budget controller
        var percentages = budgetCtrl.getPercentage();
        //update the ui with new percentages
        UICtrl.displayPercentages(percentages);
    };
    var ctrlAddItem = function () {
        var input, newItem;
        //1.get the feild input data
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.values) && input.values > 0) {

            //2.Add the item to the budgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.values);

            //3.Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the feilds
            UICtrl.clearFeilds();
            //5.calculate and update budget
            updateBudget();

            //6.calculate and update percentages
            updatePercentages();
        }
    };
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //inc-1
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1.delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            //2.delete the item from the UI
            UIController.deleteListItem(itemID);
            //3. UPDATE AND SHOW THE BUDGET
            updateBudget();
            //4.calculate and update percentages
            updatePercentages();
        }
    }

    return {
        init: function () {
            console.log("Application has started .");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentages: -1
            });

            setUpEventListeners();
        }
    }

})(budgetController, UIController);


controller.init();