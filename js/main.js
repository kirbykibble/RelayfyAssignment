var finalOrder = {};
var orderLineItems = {};
var finalAmount = 0;

$(document).ready(function () {
    loadProducts();

    //this will return a failure, since the node side wouldn't (and shouldn't) have any handlers for this post.
    $("#place-order-button").click(function () {
        fetch('OrderProcessingServlet', {
            method: 'POST',
            body: JSON.stringify({ 'order': finalOrder }),
            headers: { 'content-type': 'application/json' },
        })
            .then(function (response) {
                if (response.ok) {
                    console.log('Post Non Apple Payment successful !');
                } else {
                    console.log('Post Non Apple Payment Post failed !!!');
                }
            });
    });
    displaySelectedItemsDiv(false);
    disableNonApplePayButton(true);
    
    document.getElementById("cancel").addEventListener("click", function() {
        document.getElementById("pOptions").innerHTML = "";
        document.getElementById("prompt").style.display = "none"; 
    });
});

function disableNonApplePayButton(disable) {
    $("#place-order-button").prop('disabled', disable);
}

function displaySelectedItemsDiv(display) {
    if (display) {
        $("#selected-products-div").show();
    } else {
        $("#selected-products-div").hide();
    }
}

function loadProducts() {
    $.getJSON('products/products.json', function (data) {
        //var listItems = []; This is used to later push an array of items to the html side. No longer needed.

        //iterates through the products
        $.each(data, function (key, val) {
            var orderLineItem = { //creates a temp array. 
                "product": val,
                "count": 0
            };

            console.log(orderLineItem);
            //OH ok so this creates a complete list of items, with id as the key and the product information as the value.
            orderLineItems[orderLineItem.product.id] = orderLineItem;

            document.getElementById("productList").appendChild(createProduct(orderLineItem));
            
            /*
            **** Resctructured this section. 
            var listItem = 
                '<li>' +
                    '<a href="#">' +
                        '<img src="img/' + orderLineItem.product.image + '"/>' + 
                        '<h2>' + orderLineItem.product.name + '</h2>' +
                        '<p> ' + orderLineItem.product.description + '</p>' +
                        (typeof(orderLineItem.product.options) == "undefined" ? 
                            '<p>$' + (orderLineItem.product.price / 100) + ' ea.</p>' :
                            buildOptions(orderLineItem.product.options)) +
                    '</a>' +
                    '<a id="btn_' + orderLineItem.product.id + '_add" onclick="productAdded(this)" href="#purchase" data-rel="popup" data-position-to="window" data-transition="pop">Add</a>' +
                '</li>';

            listItems.push(listItem);*/
        });

        /*
        $("#all-products").append(listItems.join(''));
        
        // Task 2: Add the missing line. Hint: The list may need to be refreshed to reapply the styles as the list is build dynamically instead of static
        
        *** looks like you guys accidentally sent out the solution. Ah well, happens to the best of us. Either way, I, uh, restructrued this. 
        
        $("#all-products").listview('refresh'); */
    });
}

function createProduct(OLI) {
    var outer = document.createElement("div");
    outer.setAttribute("id", "product"); //styled by setting the id.
    outer.style.backgroundImage = "url('img/" + OLI.product.image + "')";
    
    var innerDiv = document.createElement("div");
    innerDiv.setAttribute("id", "separator");
    outer.appendChild(innerDiv);
    
    var details = document.createElement("div");
    details.setAttribute("id", "details");
    details.innerHTML = OLI.product.description;
    outer.appendChild(details);
    
    var productTitle = document.createElement("div");
    productTitle.setAttribute("id", "prodTitle");
    productTitle.innerHTML = OLI.product.name;
    innerDiv.appendChild(productTitle);
    
    var orderButton = document.createElement("div");
    orderButton.setAttribute("id", "orderBut");
    orderButton.innerHTML = "Add To Cart";
    innerDiv.appendChild(orderButton);

    //functionality
    outer.addEventListener("mouseover", function() {
        details.style.marginLeft = "-7vw";
        details.style.opacity = 1;
        details.style.color = "rgba(0,0,0,1)";
    });
    outer.addEventListener("mouseout", function() {
        details.style.marginLeft = "-8vw";
        details.style.opacity = 0;
        details.style.color = "rgba(0,0,0,0)";
    });
    
    //retroactive functionality for adding prices
    if(OLI.product.options == undefined) {
        details.innerHTML += "<br><br>Price: $" + OLI.product.price;
    }
    
    //adds add to cart functionality. Also adds option managing
    if(OLI.product.options == undefined) {
        //just add to cart
        orderButton.addEventListener("click", function() {
           productAdded(OLI); 
        });
    }
    else {
        orderButton.addEventListener("click", function() {
            var outerPrompt = document.getElementById("prompt");
            var promptOptions = document.getElementById("pOptions");
            var promptQuestion = document.getElementById("pTitle");
            promptQuestion.innerHTML = "Select a Size";
            outerPrompt.style.display = "flex";

            for(key in OLI.product.options) {
                var option = document.createElement("div");
                option.setAttribute("id", "option");
                option.addEventListener("click", function() { 
                    promptOptions.innerHTML = "";
                    outerPrompt.style.display = "none";
                });
                option.innerHTML = key + ": $" + OLI.product.options[key];
                promptOptions.appendChild(option);
            }
        });

    }
    return outer;
    
}


/*Refactored this to a popup.
function buildOptions(options) {
    var optionsHTML = '<p>';

    $.each(options, function(size, price) {
        optionsHTML = optionsHTML +
        '<button onclick="console.log(\'hello\')">' + size + '</button>&nbsp;&nbsp;'
    });

    optionsHTML = optionsHTML + '</p>';

    return optionsHTML;
}*/

//refactored some bits
function productAdded(OLI) {
    var productId = OLI.product.id;
//    var orderLineItem = orderLineItems[productId]; //get the item that you want to increment
//    orderLineItem.count += 1; //increment count
//    orderLineItems[productId] = orderLineItem; //update the item.
    
    orderLineItems[productId].count++; //refactored to this
    calculatePrice(); //works well enough. Throws an error since the post dest doesn't exist.
    disableNonApplePayButton(false);
    repaintSelectedList();
}

function productRemoved(OLI) {
    var productId = OLI.product.id;
    
    var orderLineItem = orderLineItems[productId];
    
    if (orderLineItem.count > 0) {
        orderLineItem.count = orderLineItem.count - 1;
        orderLineItems[productId] = orderLineItem;
        console.log(productId + " - " + orderLineItem.count);
    }
    calculatePrice();
    repaintSelectedList();
    
    //*****This is bad*****
    //if (orderLineItem.count == 0) disableNonApplePayButton(true);
    //This will disable the button if you run out of one kind of item.
    //You need to check all items in the cart.
    
    if(finalOrder.totalItems == 0) disableNonApplePayButton(true);
}

function repaintSelectedList() {
    var listSelectedItems = [];
    document.getElementById("selected-products").innerHTML = "";
    
    $.each(orderLineItems, function (key, orderLineItem) {
        if (orderLineItem.count != 0) {

            document.getElementById("selected-products").append(addToSelected(orderLineItem));
            
            //refactored a lot here
//            var listSelectedItem = 
//                '<li>' +
//                    '<a href="#">' +
//                        '<img src="content/assets/productImages/' + orderLineItem.product.image + '"/>' + 
//                        '<h2>' + orderLineItem.product.name + '</h2>' +
//                        '<p>' + (orderLineItem.count) + '</p>' +
//                        '<a id="btn_' + orderLineItem.product.id + '_add" onclick="productRemoved(this)" href="#purchase" data-rel="popup" data-position-to="window" data-transition="pop">Remove</a>' +
//                '</li>';
//
//            listSelectedItems.push(listSelectedItem);
        }
    });

//    $("#selected-products").empty();
//    $("#selected-products").append(listSelectedItems.join(''));
//    $("#selected-products").listview('refresh');

    if (finalOrder.totalItems == 0) {
        displaySelectedItemsDiv(false);
    } else {
        displaySelectedItemsDiv(true);
    }
}

function addToSelected(OLI) {
    var outer = document.createElement("div");
    outer.setAttribute("id", "selected");
    outer.style.backgroundImage = "url('img/" + OLI.product.image + "')";
    
    var infoBox = document.createElement("div");
    infoBox.setAttribute("id", "sId");
    infoBox.innerHTML = OLI.product.name + "<br><br>" + OLI.count + " currently in cart";
    outer.appendChild(infoBox);
    
    var delItem = document.createElement("div");
    delItem.setAttribute("id", "sDel");
    delItem.innerHTML = "Remove 1";
    outer.appendChild(delItem);
    
    delItem.addEventListener("click", function() {
       productRemoved(OLI); 
    });
    
    return outer;
}

function getProductId(componentId) {
    var firstIndex = componentId.indexOf('_') + 1;
    var lastIndex = componentId.lastIndexOf('_');

    return componentId.substring(firstIndex, lastIndex);
}

//this works as is. I should stylize some of the things here, but otherwise don't need to touch right now.
function calculatePrice() {
    var subTotal = 0.0;
    var totalItems = 0;
    var finalOrderItems = [];

    $.each(orderLineItems, function (key, orderLineItem) {
        if (orderLineItem.count != 0) {
            subTotal = subTotal + orderLineItem.count * orderLineItem.product.price;
            finalOrderItems.push(orderLineItem);
        }
        totalItems += orderLineItem.count;
    });
    var formattedSubTotal = subTotal / 100.0;

    $("#payment_amount").text("$" + formattedSubTotal);

    finalOrder = {
        "finalOrderItems": finalOrderItems,
        "subTotal": subTotal,
        "formattedSubTotal": formattedSubTotal,
        "totalItems" : totalItems
    };

    finalAmount = subTotal;
    console.log('Final amount : ' + finalAmount)
    console.log(JSON.stringify(finalOrder));
}

