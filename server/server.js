require("dotenv").config();
const { VoucherifyServerSide } = require("@voucherify/sdk");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const asyncHandler = require("express-async-handler");
const app = express();

const client = VoucherifyServerSide({
    applicationId: `${process.env.VOUCHERIFY_APP_ID}`,
    secretKey    : `${process.env.VOUCHERIFY_SECRET_KEY}`,
    // apiUrl: 'https://<region>.api.voucherify.io'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../client")));

app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", [ "*" ]);
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next();
});

const checkCredentials = async () => {
    try {
        await client.vouchers.list();
    } catch (error) {
        if (error.code === 401) {
            const msg = "Your API credentials are incorrect, please check your applicationId and secretKey or visit `https://docs.voucherify.io/docs/authentication` to complete your app configuration.";
            throw new Error(msg);
        }
        throw new Error(error);
    }
};
checkCredentials();

const customer = {
    "source_id": "test_customer_id_1"
};

const promotionStackableObj = {
    order: {
        amount: null,
    },
    customer   : customer,
    redeemables: []
};

app.post("/get-default-items", (req, res) => {
    return res.status(200).send(defaultItems);
});

const validateRequestedCart = requestedCart => {
    return requestedCart.map(requestedItem => {
        const item = defaultItems.find(item => requestedItem?.id && item.id === requestedItem.id);
        if (!item) {
            return false;
        }
        return { ...item, quantity: requestedItem.quantity || 0 };
    }).filter(item => !!item && item.quantity);
};

const calculateCartTotalAmount = items => items.reduce((sum, item) => sum + (item.price * item.quantity) * 100, 0).toFixed(2);

app.post("/validate-promotion", asyncHandler(async (req, res) => {
    const products = req.body.items;
    const items = validateRequestedCart(products);

    const { promotions } = await client.promotions.validate({
        customer: customer,
        order   : { amount: calculateCartTotalAmount(items) } });
    const hotPromotion = promotions.map(voucher => voucher).filter(voucher => voucher.name.startsWith("Hot Promotion"));

    return res.status(200).send(hotPromotion);
}));

const removeDuplicatedPromoObjects = array => {
    array = array.filter((value, index, self) => index === self.findIndex(t => (t.id === value.id)));
    return array;
};

app.post("/validate-stackable", asyncHandler(async (req, res) => {
    const vouchersArray = req.body.vouchersArray;
    const products = req.body.items;
    const items = validateRequestedCart(products);
    if (!vouchersArray) {
        return res.send({
            message: "Voucher code is required"
        });
    }
    promotionStackableObj.order.amount = calculateCartTotalAmount(items);
    promotionStackableObj.redeemables = vouchersArray;
    promotionStackableObj.redeemables = removeDuplicatedPromoObjects(promotionStackableObj.redeemables);

    try {
        const { redeemables, order } = await client.validations.validateStackable(promotionStackableObj);
        return res.status(200).send({
            amount     : order.amount,
            allDiscount: order.total_applied_discount_amount,
            redeemables
        });
    } catch {
        return res.status(400).send({
            status : "error",
            message: "Validate is not possible or you have used 5 possible promotions"
        });
    }
}));

app.post("/redeem-voucher", asyncHandler(async (req, res) => {
    const vouchersArray = req.body.vouchersArray;
    const products = req.body.items;
    const items = validateRequestedCart(products);

    promotionStackableObj.order.amount = calculateCartTotalAmount(items);
    promotionStackableObj.redeemables = vouchersArray;

    try {
        await client.redemptions.redeemStackable(promotionStackableObj);
        return res.status(200).send({
            status : "success",
            message: "Voucher redeemed",
        });
    } catch {
        return res.status(400).send({
            status : "error",
            message: "Voucher redeem is not possible"
        });
    }
}));

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Hot beans app listening on port ${port}`);
});

const defaultItems = [
    {
        productName       : "Johan & Nystrom Caravan",
        productDescription: "20 oz bag",
        quantity          : 0,
        price             : "26.99",
        src               : "./images/johan2.jpeg",
        id                : 1
    },
    {
        productName       : "Illy Arabica",
        productDescription: "Bestseller 18 oz bag",
        quantity          : 0,
        price             : "21.02",
        src               : "./images/illy_arabica.jpeg",
        id                : 2
    },
    {
        productName       : "Hard Beans Etiopia",
        productDescription: "6 oz bag",
        quantity          : 0,
        price             : "3.88",
        src               : "./images/hardbean.jpeg",
        id                : 3
    },
    {
        productName       : "Johan & Nystrom Bourbon",
        productDescription: "20 oz bag",
        quantity          : 0,
        price             : "41.98",
        src               : "./images/johan2.jpeg",
        id                : 4
    },
];