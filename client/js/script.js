const cartSummary = document.getElementById("cart-summary");
const checkoutButton = document.getElementById("checkout-button");
const promotionHolder = document.getElementById("promotion-holder");
const promotionsWrapper = document.querySelector(".promotions-holder");
const voucherValue = document.getElementById("voucher-code");
const buttonValidateCode = document.getElementById("check-voucher-code");
const subtotal = document.getElementById("subtotal");
const allDiscountsSpan = document.getElementById("all-discounts");
const grandTotalSpan = document.getElementById("grand-total");
const voucherForm = document.querySelector(".voucher-input-and-button-holder form");


let items = [
    {
        productName       : "Johan & Nystrom Caravan",
        productDescription: "20 oz bag",
        quantity          : 0,
        price             : "26.99",
        src               : "./images/johan2.jpeg",
    },
    {
        productName       : "Illy Arabica",
        productDescription: "Bestseller 18 oz bag",
        quantity          : 0,
        price             : "21.02",
        src               : "./images/illy_arabica.jpeg",
    },
    {
        productName       : "Hard Beans Etiopia",
        productDescription: "6 oz bag",
        quantity          : 0,
        price             : "3.88",
        src               : "./images/hardbean.jpeg",
    },
    {
        productName       : "Johan & Nystrom Bourbon",
        productDescription: "20 oz bag",
        quantity          : 0,
        price             : "41.98",
        src               : "./images/johan2.jpeg",
    },
];

const customer = {
    "id": "test_customer_id_1"
};

const promotionStackable = {
    order: {
        amount: null
    },
    customer   : customer,
    redeemables: []
};

let promotions = 0;
let grandTotal = 0;

const summaryInnerText = () => {
    cartSummary.innerHTML = `<h2>Item summary (4)</h2> ${items
        .map(
            (item, index) =>
                `<div class='item' key=${index}>
                      <img src='${item.src}' alt="product ${item.productName}"/>
                      <div class='name-and-description'>
                        <span>${item.productName}</span>
                        <span>${item.productDescription}</span>
                      </div>
                      <div class="form-and-button-holder">
                        <button class='decrement' id="decrementQuantity-${index}">-</button>
                        <form>
                        <input class='increment-input' type="number" value="${item.quantity}"/>
                        </form>
                        <button class='increment' id="incrementQuantity-${index}">+</button>
                      </div>
                      <span class="price">$${item.price}</span>
                      <button class="remove-button">Remove</button>
                     </div>`
        )
        .join("")}`;
};

cartSummary ? summaryInnerText() : "";

const quantityInputs = document.querySelectorAll(".increment-input");
const incrementButtons = document.querySelectorAll(".increment");
const decrementButtons = document.querySelectorAll(".decrement");

const incrementQuantity = () => {
    incrementButtons.forEach((button, index) => {
        button.addEventListener("dblclick", () => {
            button.disabled = true;
        });
        button.addEventListener("click", () => {
            items[index].quantity = items[index].quantity + 1;
            quantityInputs[index].value = items[index].quantity;
            summaryPrices();
            const subtotalToGrandTotal = document.getElementById("subtotal").innerHTML.replace("$", " ");
            voucherValue.value = "";
            const subtotal = document.getElementById("subtotal").innerHTML.replace("$", "");
            const filtered = promotionStackable.redeemables.filter(item => {
                return item.object !== "promotion_tier";
            });
            promotionStackable.redeemables = filtered;
            summedValuesToCheckout.promoItems = filtered;
            promotionStackable.order.amount = (subtotal * 100).toFixed(2);
            validatePromotion(promotionStackable).then(response => {
                if (response.length === 0) {
                    return;
                }
                const responsePromoTier = { id: response[0]?.id, object: response[0]?.object, discount: response[0]?.applied_discount_amount / 100 };
                responsePromoTier.id && promotionStackable.redeemables.unshift(responsePromoTier);
                button.disabled = false;
                validateCode(promotionStackable).then(response => {
                    if (response.redeemables[0].status === "APPLICABLE") {
                        const redeemablesArray = response.redeemables;
                        const promotions = redeemablesArray.reduce((sum, item) => {
                            sum = + item.order.total_discount_amount / 100;
                            return sum;
                        }, 0);
                        summedValuesToCheckout.discount = promotions;
                        summedValuesToCheckout.subtotal = subtotalToGrandTotal;
                        summedValuesToCheckout.promoItems.push(responsePromoTier);
                        renderPromoVouchers(redeemablesArray);
                        allDiscountsSpan.innerHTML = `-$${promotions.toFixed(2)}`;
                        grandTotal = addProductPrices(items) - promotions;
                        grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
                    }
                }).catch(error => {
                    promotionHolder.innerHTML = `<h5 id="error-message">${error.message}</h5>`;
                });
            }).catch(error => {
                promotionHolder.innerHTML = `<h5 id="error-message">${error.message}</h5>`;
            });
        });
    });
};
incrementQuantity();

const renderPromoVouchers = redeemablesArray => {
    promotionsWrapper.innerHTML = `<h4>Promotions:</h4> ${redeemablesArray.map((item, index) => {
        return `<div class="promotion-holder index=${index}"><h5>${item.object}<span>${(item.order.total_applied_discount_amount / 100).toFixed(2)}$ OFF</span></h5>
        <span>-$${(item.order.total_applied_discount_amount / 100).toFixed(2)}</span></div>`;
    }).join("")}`;
};

const decrementQuantity = () => {
    decrementButtons.forEach((button, index) => {
        button.addEventListener("dblclick", () => {
            button.disabled = true;
        });
        button.addEventListener("click", () => {
            if (items[index].quantity < 1) { return; }
            items[index].quantity = items[index].quantity - 1;
            quantityInputs[index].value = items[index].quantity;
            summaryPrices();
            promotions = summedValuesToCheckout.discount;
            const subtotal = document.getElementById("subtotal").innerHTML.replace("$", "");
            voucherValue.value = "";
            const filtered = promotionStackable.redeemables.filter(item => {
                return item.object !== "promotion_tier";
            });
            promotionStackable.redeemables = filtered;
            summedValuesToCheckout.promoItems = filtered;
            promotionStackable.order.amount = (subtotal * 100).toFixed(2);
            validatePromotion(promotionStackable).then(response => {
                if (response.length === 0 && subtotal <= 0 || promotionStackable.redeemables.length === 0) {
                    promotionsWrapper.innerHTML = "<h4>Promotions:</h4>";
                    promotionStackable.redeemables = [];
                    allDiscountsSpan.innerHTML = "n/a";
                    grandTotalSpan.innerHTML = `$${subtotal}`;
                }
                const responsePromoTier = { id: response[0]?.id, object: response[0]?.object, discount: response[0]?.applied_discount_amount / 100 };
                responsePromoTier.id && promotionStackable.redeemables.unshift(responsePromoTier);
                button.disabled = false;
                validateCode(promotionStackable).then(response => {
                    const redeemablesArray = response.redeemables;
                    const promotions = redeemablesArray.reduce((sum, item) => {
                        sum = + item.order.total_discount_amount / 100;
                        return sum;
                    }, 0);
                    summedValuesToCheckout.discount = promotions;
                    summedValuesToCheckout.subtotal = subtotal;
                    summedValuesToCheckout.promoItems.push(responsePromoTier);
                    allDiscountsSpan.innerHTML = `-$${(promotions).toFixed(2)}`;
                    grandTotalSpan.innerHTML = `$${(subtotal - promotions).toFixed(2)}`;
                    renderPromoVouchers(redeemablesArray);
                }).catch(error => {
                    promotionHolder.innerHTML = `<h5 id="error-message">${error.message}</h5>`;
                });
            }).catch(error => {
                promotionHolder.innerHTML = `<h5 id="error-message">${error.message}</h5>`;
            });
        });
    });
};
decrementQuantity();

const addProductPrices = items => {
    return items
        .map(item => {
            return parseFloat(item.price) * parseInt(item.quantity);
        })
        .reduce((partialSum, a) => partialSum + a, 0)
        .toFixed(2);
};

const summedValuesToCheckout = {
    discount  : "",
    subtotal  : "",
    promoItems: []
};

const summaryPrices = () => {
    const summedUpPrices = addProductPrices(items);
    subtotal.innerHTML = `$${summedUpPrices}`;
    grandTotal = summedUpPrices - promotions;
};

const validatePromotion = async promotionStackable => {
    const response = await fetch("/validate-promotion", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ promotionStackable })
    });

    const data = await response.json();
    if (response.status === 200) {
        return data;
    }
    if (response.status === 404) {
        return Promise.reject(data);
    }
    if (response.status === 400) {
        return Promise.reject(data);
    }
};

const validateCode = async promotionStackable => {
    const response = await fetch("/validate-stackable", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ promotionStackable }),
    });
    const data = await response.json();
    if (response.status === 200) {
        return data;
    }
    if (response.status === 404) {
        return Promise.reject(data);
    }
    if (response.status === 400) {
        return Promise.reject(data);
    }
};

const summedVouchersAfterValidate = result => {
    promotions = result.redeemables.reduce((sum, item) => {
        sum += item.order.total_applied_discount_amount / 100;
        return sum;
    }, 0);
    grandTotal = addProductPrices(items) - promotions;
    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
    promotionsWrapper.innerHTML = `<h4>Promotions: </h4> ${result.redeemables.map((item, index) => {
        summedValuesToCheckout.discount = item.order.total_applied_discount_amount;
        summedValuesToCheckout.promoItems.push({
            "id"      : item.id,
            "object"  : item.object,
            "discount": item.order.total_applied_discount_amount / 100
        });
        const singleItemAmount = item.order.total_applied_discount_amount / 100;
        return `<div class="promotion-holder" key=${index}><h5>${item.object}<span>${singleItemAmount.toFixed(2)}$ OFF</span></h5>
        <span>-$${singleItemAmount.toFixed(2)}</span></div>`;
    }).join("")}`;
    allDiscountsSpan.innerHTML = `-$${promotions.toFixed(2)}`;
    summedValuesToCheckout.discount = promotions;
    voucherValue.value = "";
};

const productsToSessionStorage = () => {
    const filtered = summedValuesToCheckout.promoItems.filter((item, index, array) => array.findIndex(t => t.id === item.id) === index);
    summedValuesToCheckout.promoItems = filtered;
    window.sessionStorage.setItem("values", JSON.stringify(summedValuesToCheckout));
    window.sessionStorage.setItem("products", JSON.stringify(items));
};

if (checkoutButton) {
    checkoutButton.addEventListener("click", e => {
        if (summedValuesToCheckout.promoItems.length === 0) {
            e.preventDefault();
            promotionHolder.innerHTML = "<h5 id=\"error-message\">Please validate voucher code</h5>";
        } else {
            setTimeout(() => {
                const subtotalValue = addProductPrices(items);
                summedValuesToCheckout.subtotal = subtotalValue;
                productsToSessionStorage();
                window.location.href = "/checkout.html";
            }, 1000);
        }
    });
}

const validateVoucher = () => {
    const voucherCode = voucherValue.value.trim();
    const subtotal = document.getElementById("subtotal").innerHTML.replace("$", "");
    promotionStackable.order.amount = subtotal * 100;
    if (items.reduce((a, b) => a + b.quantity, 0) === 0) {
        promotionHolder.innerHTML = "<h5 id=\"error-message\">No items in basket</h5>";

        return false;
    }
    if (!voucherCode) {
        promotionHolder.innerHTML = "<h5 id=\"error-message\">Please enter voucher code</h5>";
        return false;
    }

    const filtered = promotionStackable.redeemables.filter(item => {
        return item.object !== "promotion_tier" && item.id !== voucherCode;
    });
    promotionStackable.redeemables = filtered;

    validatePromotion(promotionStackable).then(response => {
        if (response.length === 0) {
            promotionStackable.redeemables.push({
                object: "voucher",
                id    : voucherCode
            });
            return;
        } else {
            promotionStackable.redeemables.unshift({
                object  : response[0].object,
                id      : response[0].id,
                discount: response[0].order.total_applied_discount_amount / 100
            });
            promotionStackable.redeemables.push({
                object: "voucher",
                id    : voucherCode
            });
        }
    }).then(() => {
        validateCode(promotionStackable).then(
            response => {
                const result = response.redeemables[response.redeemables.length - 1];
                if (result.status === "APPLICABLE") {
                    const discount = result.order.total_applied_discount_amount / 100;
                    promotionStackable.redeemables[promotionStackable.redeemables.length - 1].discount = discount;
                    summedVouchersAfterValidate(response);
                }
            }
        ).catch(error => {
            promotionsWrapper.innerHTML = `<h4>Promotions:</h4><div class="promotion-holder"><h5 id="error-message">${error.message}</h5></div>`;
            voucherValue.value = "";
            promotionStackable.redeemables = [];
            allDiscountsSpan.innerHTML = "n/a";
        });
    });
};

if (buttonValidateCode) {
    buttonValidateCode.addEventListener("click", validateVoucher) || voucherValue.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            voucherForm.addEventListener("submit", e => {
                e.preventDefault();
            });
            validateVoucher();
        }
    });
}


window.addEventListener("load", () => {
    sessionStorage.removeItem("values");
    sessionStorage.removeItem("products");
});