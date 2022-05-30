window.addEventListener("load", () => {
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
            grandTotalValueSpan.innerHTML = `$${(values[0].subtotal - values[0].discount + parseFloat(shippingValueSpan.innerHTML)).toFixed(2)}`;
        });
        shippingValueSpan.innerHTML = "$" + shippingValueSpan.innerHTML;
    };

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

    innerSummedValues(discountValueSpan, subtotalValueSpan, allDiscountsValueSpan, couponValueSpan, shippingValueSpan, couponsWrapper);
    innerSummedProducts(summedProducts);

    const values = JSON.parse(sessionStorage.getItem("values") || "[]");
    const promoItemsArray = values[0].promoItems;
    const subtotalAmount = values[0].subtotal;

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
                completeOrderButton.innerHTML = `<h5 id="error-message">${error.message}</h5>`;
            });
    });
});