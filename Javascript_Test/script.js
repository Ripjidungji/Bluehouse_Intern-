
// QUESTION 1
// Function Declaration

function sayHello(name) {
    return `Hello, ${name}!`;
}

function showQuestion1() {

    let name = prompt("Enter your name:");

    if (name !== null && name !== "") {
        document.getElementById("result1").innerHTML =
            sayHello(name);
    }
}


// QUESTION 2
// Function Expression

const subtract = function(a, b) {
    return a - b;
};

function showQuestion2() {

    let a = Number(prompt("Enter the first number:"));
    let b = Number(prompt("Enter the second number:"));

    document.getElementById("result2").innerHTML =
        `${a} - ${b} = ${subtract(a, b)}`;
}


// QUESTION 3
// Arrow Function

const divide = (x, y) => {
    return x / y;
};

function showQuestion3() {

    let x = Number(prompt("Enter the first number:"));
    let y = Number(prompt("Enter the second number:"));

    if (y !== 0) {
        document.getElementById("result3").innerHTML =
            `${x} / ${y} = ${divide(x, y)}`;
    } else {
        document.getElementById("result3").innerHTML =
            "You cannot divide by zero.";
    }
}


// QUESTION 4
// Default Parameters

function welcome(name = "Visitor", city = "Unknown") {
    return `${name} is from ${city}`;
}

function showQuestion4() {

    let name = prompt(
        "Enter your name (or leave empty for Visitor):"
    );

    let city = prompt(
        "Enter your city (or leave empty for Unknown):"
    );

    // Use default values when input is empty
    if (name === "") {
        name = undefined;
    }

    if (city === "") {
        city = undefined;
    }

    document.getElementById("result4").innerHTML =
        welcome(name, city);
}


// QUESTION 5
// Higher-Order Function

function operate(num, func1, func2) {
    return func2(func1(num));
}

function double(number) {
    return number * 2;
}

function addFive(number) {
    return number + 5;
}

function showQuestion5() {

    let num = Number(
        prompt("Enter a number:")
    );

    let result = operate(num, double, addFive);

    document.getElementById("result5").innerHTML =
        `The result is: ${result}`;
}


// QUESTION 6
// IIFE

const iifeResult = (function() {
    return "I run immediately!";
})();

function showQuestion6() {

    document.getElementById("result6").innerHTML =
        iifeResult;
}


// QUESTION 7
// Object

const car = {

    brand: "Toyota",

    getInfo: function() {
        return `This car is a ${this.brand}`;
    }

};

function showQuestion7() {

    let brand = prompt(
        "Enter the car brand:"
    );

    if (brand !== null && brand !== "") {

        car.brand = brand;

        document.getElementById("result7").innerHTML =
            car.getInfo();
    }
}


// QUESTION 8
// Arrow Function

const isEven = (n) => {
    return n % 2 === 0;
};

function showQuestion8() {

    let n = Number(
        prompt("Enter a number:")
    );

    let result = isEven(n);

    document.getElementById("result8").innerHTML =
        result;
}