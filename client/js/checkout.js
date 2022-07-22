import {
    redeemVoucherButton,
    renderVoucherPropertiesFromStorage,
    renderProductsFromStorage,
    getCartAndVoucherFromSessionStorage,
    filterAndReduceProducts
} from "./lib.js";

const state = {
    products         : [],
    voucherProperties: {}
};

getCartAndVoucherFromSessionStorage().then(data => {
    state.products = data.products;
    state.voucherProperties = data.voucherProperties;
    renderProductsFromStorage(state.products);
    renderVoucherPropertiesFromStorage(state.voucherProperties, state.products);
});

const fetchRedeemVoucher = async (voucherProperties, products) => {
    try {
        const { items } = filterAndReduceProducts(products);
        const response = await fetch("/redeem-voucher", {
            method : "POST",
            headers: {
                "Accept"      : "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ vouchersArray: voucherProperties.redeemables, items }),
        });

        const data = await response.json();
        if (data.status !== 200) {
            throw new Error(data.message);
        }
        if (data.status !== "success") {
            throw new Error("Redeem voucher is not possible");
        }
        redeemVoucherButton.innerHTML = `${data.message}`;
        return data;
    } catch (error) {
        redeemVoucherButton.innerHTML = `${error.message}`;
    }
};

redeemVoucherButton.addEventListener("click", e => {
    e.preventDefault();
    fetchRedeemVoucher(state.voucherProperties, state.products);
    window.sessionStorage.clear();
});