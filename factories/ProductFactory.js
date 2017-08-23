const Product = require('../models/Product');

module.exports = {

    /**
     * Create a product from an HTMLElement
     * @param {HTMLElement} element
     */
    fromDOM(element) {
        let name = element.querySelector('.productlist__name a span').innerHTML.trim();
        let [currency, price] = element.querySelector('.productlist__price .gh_price .gh_price').innerHTML.trim().split(' ');

        price = parseFloat(price.replace(/\./g, '').replace(/,/, '.'));

        return new Product(name, price);
    }
};
