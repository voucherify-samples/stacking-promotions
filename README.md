1. [About Voucherify Example](#voucherify-example)
2. [How Voucherify works](#voucherify-works)
3. [Demo](#demo)
4. [Quickstart](#quickstart)
5. [How to run Voucherify samples locally](#voucherify-locally)
6. [Get support](#support)


# Stacking-promotions with Voucherify <a id="voucherify-example"></a>


This sample shows you how to stack different types of promotions with Voucherify. This is achieved by integrating [validate stackable](https://docs.voucherify.io/reference/validate-stacked-discounts-1) and [redeem stackable](https://docs.voucherify.io/reference/redeem-stacked-discounts) endpoints. The stacking mechanism allows you to combine up to 5 promo codes or cart-level promotions with a single request.

Validating and accepting promo codes in your checkout from scratch might be tricky — calculating discounted prices, error message handling, and localization are just a few things to think about when building a simple promo code redemption flow.

This is where [Voucherify promotion engine](https://docs.voucherify.io/docs) kicks in. Together with our [Promo UI Kit](https://www.figma.com/community/file/1100356622702326488) you can quickly build the best promotion experience for your customers.

This example introduce online coffee shop and many vouchers in your dashboard are about it.

## How Voucherify works <a id="voucherify-works"></a>

Note: while calling the [redeem stackable endpoint](https://docs.voucherify.io/reference/redeem-stacked-discounts) is enough to satisfy a basic promo code flow, it's useful to add [validate stackable](https://docs.voucherify.io/reference/validate-stacked-discounts-1) to the flow every time the promo code or cart changes. Validation performs 1-3 points but it doesn't marks the code as used one.

![](https://github.com/voucherify-samples/voucher-code-redemption/blob/refactor-code/voucherify-integration.png)

## Demo <a id="demo"></a>

Live demo on:<br>
[<img src="https://cdn.icon-icons.com/icons2/2699/PNG/512/heroku_logo_icon_169035.png" width="100px"/>](https://v-voucher-code-redemption.herokuapp.com/)

![](https://github.com/voucherify-samples/voucher-code-redemption/blob/main/free_shipping.gif)

The demo is running with a [Sandbox project](https://docs.voucherify.io/docs/testing). Sandbox comes with several test vouchers you can apply in the checkout, e.g.:

``FREE-SHIPPING`` - You find it in your [Vouchers](https://docs.voucherify.io/docs/vouchers-1) dashboard but if there is not Free Shipping Voucher you have to create code with free shipping on [Sandbox](https://docs.voucherify.io/docs/free-shipping-discount).

``BLCKFRDY`` ``50%OFF`` and many other vouchers you find in your [Sandbox](https://docs.voucherify.io/docs/free-shipping-discount) > Vouchers.

Some codes have a [validation rules](https://docs.voucherify.io/docs/validation-rules) or different [discount effects](https://docs.voucherify.io/docs/discount-effects) so do not use them or you will not be charged a discount.

The promo code box accepts Amount and Percentage [discount types](https://docs.voucherify.io/docs/vouchers-1#discount-coupons), more coming soon. 


This sample calls three endpoints:

* [Validate promotion](https://docs.voucherify.io/reference/validate-promotions-1) - check if any [promotion tier](https://docs.voucherify.io/docs/promotion-tier) exist.
* [Validate voucher code](https://docs.voucherify.io/reference/validate-voucher) — checks the code against [validation rules](https://docs.voucherify.io/docs/validation-rules) and returns calculated discounts.
* [Redeem voucher code](https://docs.voucherify.io/reference/redeem-voucher) — runs validation and then marks the voucher as used. After click redemption button you should see message "Voucher redemeed" - that means your redemption process was successfull.

## Quickstart <a id="quickstart"></a>
Before you run this example locally let's check how to started with Voucherify API and dashboard by redeeming your first coupon code by going to [Quickstart](https://docs.voucherify.io/docs/quickstart). This informations helps you understand conception about Voucherify product.

## How to run Voucherify samples locally? <a id="voucherify-locally"></a>

This sample is built with Node.js and our [JS SDK](https://github.com/voucherifyio/voucherify-js-sdk) on the server side and HTML + Vanilla JavaScript on the front (with React version coming soon).

Follow the steps below to run locally.

1. Clone repository.

```
git clone https://github.com/voucherify-samples/stacking-promotions.git
```
2. Create your [Voucherify account](http://app.voucherify.io/#/signup) (free tier, no credit card required).

3. Go to the Sandbox project’s settings and get your Application ID and Secret Key, see [Authentication](https://docs.voucherify.io/docs/authentication).

4. Rename .env.example to .env and paste your API keys:
```
VOUCHERIFY_APP_ID=<replace-with-your-application-id>
VOUCHERIFY_SECRET_KEY=<replace-with-your-secret-key>
```
5. Install dependencies.
```
npm install / yarn install
```
6. Start the Node server by entering one of the commands in the terminal.
```
npm run start / npm run dev || yarn start / yarn run dev 
```
7. Go to [http://localhost:3000](http://localhost:3000/) in your browser.


## Get support <a id="support"></a>

If you found a bug or want to suggest a new sample, please file an issue.

If you have questions, comments, or need help with code, we’re here to help:
* on [Slack](https://www.voucherify.io/community)
* by [email](https://www.voucherify.io/contact-support)

For more tutorials and full API reference, visit our [Developer Hub](https://docs.voucherify.io).

## Authors
[@patricioo1](https://github.com/patricioo1)
