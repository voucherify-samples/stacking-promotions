import {
    getCartAndVoucherFromSessionStorage,
    getCartPreviewRender,
    checkoutButton,
    displayErrorMessage,
    filterAndReduceProducts,
    getOrderSummaryRender,
    saveCartAndVoucherInSessioStorage,
    checkIfNoErrors,
    filterPromotionTierFromVouchers
} from "./lib.js";

const state = {
    products         : [],
    voucherProperties: {}
};

getCartAndVoucherFromSessionStorage().then(data => {
    state.products = data.products;
    state.voucherProperties = data.voucherProperties;
    renderCartPreview(state.products);
    renderOrderSummary(state.products, state.voucherProperties);
});

const onIncrement = async (index, render) => {
    state.products[index].quantity++;
    await checkPromotionTier(state.products);
    try {
        await validateAndUpdateVoucherProperties(state.voucherProperties, state.products);
    } catch (error) {
        displayErrorMessage(error.message);
    }
    render(state.products);
    renderOrderSummary(state.products, state.voucherProperties);
};
const onDecrement = async (index, render) => {
    if (state.products[index].quantity <= 0) { return; }
    state.products[index].quantity--;
    await checkPromotionTier(state.products);
    try {
        await validateAndUpdateVoucherProperties(state.voucherProperties, state.products);
    } catch (error) {
        displayErrorMessage(error.message);
    }
    render(state.products);
    renderOrderSummary(state.products, state.voucherProperties);
};
const renderCartPreview = getCartPreviewRender({ onIncrement, onDecrement });

const onVoucherCodeSubmit = async (voucher, render) => {
    try {
        checkIfNoErrors(state.products, voucher);
        await checkPromotionTier(state.products);
        await validateAndUpdateVoucherProperties(state.voucherProperties, state.products);
        render(state.products, state.voucherProperties);
    } catch (error) {
        displayErrorMessage(error.message, voucher);
    }
};
const renderOrderSummary = getOrderSummaryRender({ onVoucherCodeSubmit });

const checkPromotionTier = async products => {
    filterPromotionTierFromVouchers(state.voucherProperties);
    const { items } = filterAndReduceProducts(products);
    const response = await fetch("/validate-promotion", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ items })
    });
    const data = await response.json();
    if (data.length) {
        const { object, id } = await data[0];
        state.voucherProperties.redeemables.unshift({ object: object, id: id });
    }
    return data;
};

const validateAndUpdateVoucherProperties = async (voucherProperties, products) => {
    if (!voucherProperties.redeemables.length) {
        return;
    }
    const { items } = filterAndReduceProducts(products);
    const response = await fetch("/validate-stackable", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ vouchersArray: voucherProperties.redeemables, items }),
    });
    const data = await response.json();
    if (response.status !== 200) {
        state.voucherProperties.redeemables.pop();
        throw new Error(data.message);
    }
    state.voucherProperties.amount = data.amount;
    state.voucherProperties.redeemables = data.redeemables
        .map(item => { return { object: item.object, id: item.id, discount: item.order.total_applied_discount_amount }; })
        .filter(voucher => voucher.discount !== 0);
    return data;
};

checkoutButton.addEventListener("click", e => {
    if (!state.voucherProperties.redeemables.length || state.products.reduce((a, b) => a + b.quantity, 0) <= 0) {
        e.preventDefault();
        alert("Please validate voucher code or add items to basket");
        return false;
    }
    saveCartAndVoucherInSessioStorage(state.products, state.voucherProperties);
    window.location.href = "/checkout.html";
});