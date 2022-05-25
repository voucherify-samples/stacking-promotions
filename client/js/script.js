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
        quantity          : 1,
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
        button.addEventListener("click", () => {
            items[index].quantity = items[index].quantity + 1;
            quantityInputs[index].value = items[index].quantity;
            summaryPrices();
            const subtotalToGranTotal = document.getElementById("subtotal").innerHTML.replace("$", " ");
            voucherValue.value = "";
            const orderAmount = document.getElementById("grand-total").innerHTML.replace("$", " ");
            validateTier(orderAmount).then(response => {
                const promoTier = response.redeemables[0];
                if (promoTier.status === "APPLICABLE") {
                    const promotions = response.order.total_applied_discount_amount / 100;
                    summedValuesToCheckout[0].discount = promotions;
                    summedValuesToCheckout[0].subtotal = subtotalToGranTotal;
                    promoItemToStorage(promoTier);
                    sessionStorage.setItem("values", JSON.stringify(summedValuesToCheckout));
                    const values = JSON.parse(sessionStorage.getItem("values") || "[]");
                    const promoItems = values[0].promoItems;
                    promotionsWrapper.innerHTML = `<h4>Promotions:</h4> ${promoItems.map((item, index) => {
                        return `<div class="promotion-holder index=${index}"><h5>${item.object}<span>${item.discount.toFixed(2)}$ OFF</span></h5>
                        <span>-$${item.discount.toFixed(2)}</span></div>`;
                    }).join("")}`;
                    allDiscountsSpan.innerHTML = `-$${promotions.toFixed(2)}`;
                    grandTotal = addProductPrices(items) - promotions;
                    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
                }
            }).catch(error => {
                promotionHolder.innerHTML = `<h5 id="error-message">${error.message}</h5>`;
            });
        });
    });
};
incrementQuantity();


const decrementQuantity = () => {
    decrementButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            if (items[index].quantity < 1) { return; }
            items[index].quantity = items[index].quantity - 1;
            quantityInputs[index].value = items[index].quantity;
            summaryPrices();
            voucherValue.value = "";
            const values = JSON.parse(sessionStorage.getItem("values") || "[]");
            let promotions = values[0].discount;
            const subtotalToGranTotal = document.getElementById("subtotal").innerHTML.replace("$", " ");
            grandTotalSpan.innerHTML = `$${(subtotalToGranTotal - promotions).toFixed(2)}`;
            const orderAmount = document.getElementById("grand-total").innerHTML.replace("$", " ");
            if (orderAmount < 40) {
                promotions = values[0].discount - 10;
                grandTotalSpan.innerHTML = `$${(subtotalToGranTotal - promotions).toFixed(2)}`;
                const filtered = values[0].promoItems.filter(item => {
                    return item.id !== "promo_0ONBGj3HnpivcjhrwZZt4zTG";
                });
                summedValuesToCheckout[0].promoItems = filtered;
                sessionStorage.setItem("values", JSON.stringify(summedValuesToCheckout));
                const summedValues = JSON.parse(sessionStorage.getItem("values") || "[]");
                const promoItems = summedValues[0].promoItems;
                promotionsWrapper.innerHTML = `<h4>Promotions:</h4> ${promoItems.map((item, index) => {
                    return `<div class="promotion-holder index=${index}"><h5>${item.object}<span>${item.discount.toFixed(2)}$ OFF</span></h5>
                    <span>-$${item.discount.toFixed(2)}</span></div>`;
                }).join("")}`;
            }
            if (orderAmount < 0) {
                grandTotalSpan.innerHTML = "$0.00";
            }
            allDiscountsSpan.innerHTML = `-$${(promotions).toFixed(2)}`;
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

const summedValuesToCheckout = [
    {
        discount  : "",
        subtotal  : "",
        promoItems: []
    }
];

const summaryPrices = () => {
    const summedUpPrices = addProductPrices(items);
    subtotal.innerHTML = `$${summedUpPrices}`;
    grandTotal = summedUpPrices - promotions;
    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
};

const validateCode = async (voucherCode, orderAmount) => {
    const response = await fetch("/validate-stackable", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucherCode, orderAmount }),
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

const redeemCode = async (promoItemsArray, subtotalAmount) => {
    const response = await fetch("/redeem-stackable", {
        method : "POST",
        headers: {
            //prettier-ignore
            "Accept"      : "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ promoItemsArray, subtotalAmount }),
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

const removePromoFromBackend = async emptyArray => {
    const response = await fetch("/remove-promo", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ emptyArray }),
    });
    return response;
};

const validateTier = async orderAmount => {
    const response = await fetch("/validate-tier", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderAmount }),
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
    promotions = result.order.total_applied_discount_amount ? result.order.total_applied_discount_amount / 100 : 0;
    grandTotal = addProductPrices(items) - promotions;
    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
    promotionsWrapper.innerHTML = `<h4>Promotions: </h4> ${result.redeemables.map((item, index) => {
        promoItemToStorage(item);
        const singleItemAmount = item.order.total_applied_discount_amount / 100;
        return `<div class="promotion-holder" key=${index}><h5>${item.object}<span>${singleItemAmount.toFixed(2)}$ OFF</span></h5>
        <span>-$${singleItemAmount.toFixed(2)}</span></div>`;
    }).join("")}`;
    allDiscountsSpan.innerHTML = `-$${promotions.toFixed(2)}`;
    summedValuesToCheckout[0].discount = promotions;
    sessionStorage.setItem("values", JSON.stringify(summedValuesToCheckout));
    voucherValue.value = "";
};

const promoItemToStorage = item => {
    const filtered = summedValuesToCheckout[0].promoItems.filter(promoItem => {
        return promoItem.id !== item.id;
    });
    summedValuesToCheckout[0].promoItems = filtered;

    summedValuesToCheckout[0].promoItems.push({
        "object"  : item.object,
        "discount": item.order.total_applied_discount_amount / 100,
        "id"      : item.id
    });
};

if (checkoutButton) {
    checkoutButton.addEventListener("click", e => {
        if (sessionStorage.length === 0) {
            e.preventDefault();
            promotionHolder.innerHTML = "<h5 id=\"error-message\">Please validate voucher code</h5>";
        } else {
            setTimeout(() => {
                const subtotalValue = addProductPrices(items);
                summedValuesToCheckout[0].subtotal = subtotalValue;
                sessionStorage.setItem("values", JSON.stringify(summedValuesToCheckout));
                window.location.href = "/checkout.html";
                grandTotalSpan.innerHTML = `$${(grandTotal + promotions).toFixed(2)}`;
                allDiscountsSpan.innerHTML = "n/a";
                promotionHolder.innerHTML = "";
            }, 1000);
        }
    });
}

const productsToSessionStorage = () => {
    window.sessionStorage.setItem("products", JSON.stringify(items));
};

const validateVoucher = () => {
    const voucherCode = voucherValue.value.trim();
    const orderAmount = document.getElementById("grand-total").innerHTML.replace("$", "").trim();

    if (items.reduce((a, b) => a + b.quantity, 0) === 0) {
        promotionHolder.innerHTML = "<h5 id=\"error-message\">No items in basket</h5>";

        return false;
    }
    if (!voucherCode) {
        promotionHolder.innerHTML = "<h5 id=\"error-message\">Please enter voucher code</h5>";
        return false;
    }

    validateCode(voucherCode, orderAmount).then(
        result => {
            if (result.order.total_applied_discount_amount) {
                summedVouchersAfterValidate(result);
                productsToSessionStorage();
            }
        }
    ).catch(error => {
        promotionsWrapper.innerHTML += `<div class="promotion-holder"><h5 id="error-message">${error.message}</h5></div>`;
        buttonValidateCode.disabled = true;
    });
};

if (voucherValue) {
    voucherValue.addEventListener("input", () => {
        if (voucherValue.value === "") {
            checkoutButton.innerHTML = "Checkout";
        }
    });
}

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

const innerSummedProducts = summedProducts => {
    const products = JSON.parse(sessionStorage.getItem("products") || "[]");
    summedProducts.innerHTML = `${products.map((item, index) => {
        if (item.quantity === 0) {
            return;
        } else {
            return `<div class="each-product" key=${index}>
                <img src="${item.src}" />
                <div class="each-product-name">
                    <h6>${item.productName}</h6>
                    <p>Quantity ${item.quantity}</p>
                </div>
                <span>$${item.price}</span>
            </div>`;
        }
    }).join("")}`;
};

const innerSummedValues = (discountValueSpan, subtotalValueSpan, allDiscountsValueSpan, couponValueSpan, shippingValueSpan, couponsWrapper) => {
    const values = JSON.parse(sessionStorage.getItem("values") || "[]");
    couponsWrapper.innerHTML = `${values[0].promoItems.map((item, index) => {
        return `<h5 class="coupon" index=${index}">${item.object}&nbsp;<span class="coupon-value">(-$${item.discount})</span></h5>`;
    }).join("")}`;
    values[0].promoItems.map(item => {
        discountValueSpan.innerHTML = `-$${values[0].discount}`;
        allDiscountsValueSpan.innerHTML = `-$${values[0].discount}`;
        subtotalValueSpan.innerHTML = `$${values[0].subtotal}`;
        const grandTotalValueSpan = document.querySelector(".grand-total span");
        shippingValueSpan.innerHTML = `${item.id === "FREE SHIPPING" ? item.discount : shippingValueSpan.innerHTML}`;
        grandTotalValueSpan.innerHTML = `$${(values[0].subtotal - values[0].discount + parseInt(shippingValueSpan.innerHTML)).toFixed(2)}`;
    });
    shippingValueSpan.innerHTML = "$" + shippingValueSpan.innerHTML;
};


if (window.location.href === "http://localhost:3000/" || window.location.href === "http://localhost:3000/index.html") {
    window.addEventListener("load", () => {
        summaryPrices();
        removePromoFromBackend([]);
        sessionStorage.removeItem("values");
        sessionStorage.removeItem("products");
    });
}

if (window.location.href === "http://localhost:3000/checkout.html") {
    const summedProducts = document.querySelector(".summed-products");
    const couponValueSpan = document.querySelector(".coupon");
    const discountValueSpan = document.querySelector(".discount-value span");
    const subtotalValueSpan = document.querySelector(".subtotal span");
    const allDiscountsValueSpan = document.querySelector(".all-discounts span");
    const shippingValueSpan = document.querySelector(".shipping span");
    const completeOrderButton = document.querySelector(".nav-buttons button");
    const couponsWrapper = document.querySelector(".coupons");

    document.getElementById("ephone").value = "voucherify@sample.io";
    document.getElementById("fullname").value = "Jack Smith";
    document.getElementById("company").value = "Voucherify";
    document.getElementById("adress").value = "Magic Street 10";
    document.getElementById("postal").value = "11-130";
    document.getElementById("city").value = "Warsaw";

    innerSummedValues(discountValueSpan, subtotalValueSpan, allDiscountsValueSpan, couponValueSpan, shippingValueSpan, couponsWrapper);
    innerSummedProducts(summedProducts);

    const values = JSON.parse(sessionStorage.getItem("values") || "[]");
    const promoItemsArray = values[0].promoItems;
    const subtotalAmount = values[0].subtotal;

    completeOrderButton.addEventListener("click", e => {
        e.preventDefault();
        redeemCode(promoItemsArray, subtotalAmount)
            .then(result => {
                if (result.status === "SUCCESS") {
                    setTimeout(() => {
                        completeOrderButton.innerHTML = "Order completed";
                    }, 1000);
                }
            })
            .catch(error => {
                promotionHolder.innerHTML = `<h5 id="error-message">${error.message}</h5>`;
            });
    });
}