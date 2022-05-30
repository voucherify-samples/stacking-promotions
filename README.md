 # Stacking-promotions with Voucherify


This sample shows you how to stack different types of promotions with Voucherify. This is achieved by integrating [validate stackable](https://docs.voucherify.io/reference/validate-stacked-discounts-1) and [redeem stackable](https://docs.voucherify.io/reference/redeem-stacked-discounts) endpoints. The stacking mechanism allows you to combine up to 5 promo codes or cart-level promotions with a single request.

The demo is running with a [Sandbox project](https://docs.voucherify.io/docs/testing). Sandbox comes with several test vouchers and [cart-level promotions](https://docs.voucherify.io/docs/promotion-tier) you can apply in the checkout, e.g.:

``Hot Promotion`` - tier 1: $10 off with $40+ order, tier 2: $20 off with $80+

``BLCKFRDY`` ``FREE-ARABICA-NGCXu`` ``HAPPY-ORDERyra`` ``GIFT-AeJ1nlqXRo9szSwF`` ``HAPPY-ORDER11T`` ``HAPPY-ORDERxq7`` ``FREE-SHIPPING``

This sample calls two endpoints:

* [Validate stackable discounts](https://docs.voucherify.io/reference/validate-stacked-discounts-1) - checks up to 5 promo objects against [validation rules](https://docs.voucherify.io/docs/validation-rules) and returns calculated discounts
* [Redeem stackable discounts](https://docs.voucherify.io/reference/redeem-stacked-discounts) - runs validation and then marks the discounts as used

## How to run Voucherify samples locally?

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
npm install
```
6. Start the Node server by entering the command in the terminal.
```
npm run start
```
7. Go to [http://localhost:3000](http://localhost:3000/) in your browser.


## Get support

If you found a bug or want to suggest a new sample, please file an issue.

If you have questions, comments, or need help with code, we’re here to help:
* on [Slack](https://www.voucherify.io/community)
* by [email](https://www.voucherify.io/contact-support)

For more tutorials and full API reference, visit our [Developer Hub](https://docs.voucherify.io).

## Authors
[@patricioo1](https://github.com/patricioo1)
